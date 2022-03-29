import React, { useState } from "react";
import Title from "../../components/Title";
import { useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardMedia,
  Container,
  Divider,
  Grid,
  Link,
  Skeleton,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import SolanaLogo from "../../assets/img/solana-logo.svg";
import ArweaveLogo from "../../assets/img/arweave-logo.svg";
import { network } from "../../config/solanaNetwork";
import { useNft } from "../../services/hooks/nft";
import NotFoundNFT from "../NotFoundNFT";
import { useSnackbar } from "notistack";
import LinkButton from "../../components/LinkButton";
import { TableCellName, TableCellValue } from "./styles";
import { isBackendEnabled } from "../../config/api";
import { PublicKey } from "@solana/web3.js";
import api from "../../services/api";
import { ErrorsResponse, NftExtraData } from "../../types/types";

export default function ShowNft() {
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const { publicKey } = useWallet();
  const { mint } = useParams<{ mint: string }>();
  const { data, error } = useNft(mint);
  const { enqueueSnackbar } = useSnackbar();

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    enqueueSnackbar("Valor copiado para a área de transferência", {
      variant: "success",
    });
  };

  const addNftLike = async () => {
    if (!publicKey) {
      enqueueSnackbar("Conecte-se a sua carteira antes de curtir o NFT", {
        variant: "info",
      });
      return;
    }
    try {
      new PublicKey(mint);
    } catch (error) {
      enqueueSnackbar("NFT inválido", { variant: "error" });
      return;
    }
    await api
      .post<NftExtraData>("/nft/like", {
        mint: mint,
        walletAddress: publicKey,
      })
      .then(() => {
        enqueueSnackbar("Curtida adicionada", { variant: "success" });
      })
      .catch((error) => {
        if (error.response && "errors" in error.response.data) {
          const errorData = error.response.data as ErrorsResponse;
          const errorMessage = errorData.errors
            .map((errorResponse) => errorResponse.msg)
            .join(" ");

          enqueueSnackbar(errorMessage, {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Erro inesperado", {
            variant: "error",
          });
        }
      });
  };

  return (
    <Container
      component="main"
      maxWidth="xl"
      sx={{
        overflowX: "hidden",
        padding: (theme) => `${theme.spacing(5)} !important`,
      }}
    >
      {error !== undefined && <NotFoundNFT message="NFT não encontrado" />}
      {error === undefined && <Title title="Explorar NFT" />}
      <Grid container spacing={6}>
        <Grid item key="image" xs={12} md={6}>
          {data === undefined && error === undefined && (
            <Skeleton variant="rectangular" height="70vh" width="100%" />
          )}
          {data && (
            <Card sx={{ position: "sticky", top: 0 }}>
              <Box position="relative">
                {isBackendEnabled && (
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "white",
                      borderRadius: 4,
                      padding: 1,
                      cursor: "pointer",
                    }}
                    onClick={addNftLike}
                  >
                    <Typography noWrap variant="body1">
                      {data.extraData?.numberLikes || 0}
                    </Typography>
                    <FavoriteBorderIcon
                      color="success"
                      sx={{ marginLeft: 0.5 }}
                    />
                  </Box>
                )}
                <Box style={isImageLoaded ? { display: "none" } : {}}>
                  <Skeleton variant="rectangular" sx={{height: "450px", maxWidth: "100%"}} />
                </Box>
                <CardMedia
                  style={isImageLoaded ? {} : { display: "none" }}
                  component="img"
                  alt={`${data.metadata.name} (NFT)`}
                  onLoad={() => setIsImageLoaded(true)}
                  sx={{
                    height: "auto",
                    maxWidth: "100%",
                  }}
                  image={data.metadata.image}
                />
              </Box>
              <CardActions sx={{ padding: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <LinkButton
                      text="Visualizar imagem"
                      href={data.metadata.image}
                      alt="Arweave icon"
                      icon={ArweaveLogo}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LinkButton
                      text="Visualizar token"
                      href={`https://solscan.io/token/${data.nft.mint}/${
                        network === WalletAdapterNetwork.Devnet
                          ? "?cluster=devnet"
                          : ""
                      }`}
                      alt="Solana icon"
                      icon={SolanaLogo}
                    />
                  </Grid>
                </Grid>
              </CardActions>
            </Card>
          )}
        </Grid>
        <Grid item key="data" xs={12} md={6}>
          {data === undefined && error === undefined && (
            <>
              <Skeleton variant="rectangular" height="33vh" width="100%" />
              <Skeleton
                variant="rectangular"
                height="33vh"
                width="100%"
                sx={{ marginTop: "4vh" }}
              />
            </>
          )}
          {data && (
            <>
              <Card>
                <Box padding={3}>
                  <Typography
                    color="primary"
                    variant="h4"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 500,
                    }}
                  >
                    {data.metadata.name}{" "}
                    {data.metadata.symbol && `(${data.metadata.symbol})`}
                  </Typography>
                  {data.metadata.description && (
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 300, marginBottom: 2 }}
                    >
                      {data.metadata.description}
                    </Typography>
                  )}
                  {data.metadata.external_url && (
                    <Link
                      variant="h6"
                      target="_blank"
                      rel="noreferrer noopener"
                      href={data.metadata.external_url}
                    >
                      {data.metadata.external_url}
                    </Link>
                  )}
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" padding={3}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    maxWidth="170px"
                    width="100%"
                  >
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                      Preço:
                    </Typography>
                    <Typography variant="h5">
                      {" "}
                      &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp; SOL
                    </Typography>
                  </Box>
                  <Button
                    disabled
                    variant="contained"
                    startIcon={<AccountBalanceWalletIcon />}
                  >
                    Comprar
                  </Button>
                </Box>
              </Card>
              <Card sx={{ padding: 3, marginTop: 4 }}>
                <Typography
                  color="primary"
                  variant="h4"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  Detalhes do NFT
                </Typography>
                <Box sx={{ marginTop: 3 }}>
                  <TableContainer>
                    <Table sx={{ tableLayout: "fixed" }}>
                      <TableBody>
                        <TableRow>
                          <TableCellName>
                            <Typography variant="h5" sx={{ fontWeight: 500 }}>
                              Token
                            </Typography>
                          </TableCellName>
                          <TableCellValue title="Clique para copiar">
                            <Typography
                              noWrap
                              variant="h6"
                              sx={{ fontWeight: 300, cursor: "pointer" }}
                              onClick={() => copyToClipboard(data.nft.mint)}
                            >
                              {data.nft.mint}
                            </Typography>
                          </TableCellValue>
                        </TableRow>
                        <TableRow>
                          <TableCellName>
                            <Typography variant="h5" sx={{ fontWeight: 500 }}>
                              Dono
                            </Typography>
                          </TableCellName>
                          <TableCellValue title="Clique para copiar">
                            <Typography
                              noWrap
                              variant="h6"
                              sx={{ fontWeight: 300, cursor: "pointer" }}
                              onClick={() =>
                                copyToClipboard(data.nft.updateAuthority)
                              }
                            >
                              {data.nft.updateAuthority}
                            </Typography>
                          </TableCellValue>
                        </TableRow>
                        {data.metadata.properties.creators &&
                          data.metadata.properties.creators !== [] && (
                            <TableRow>
                              <TableCellName>
                                <Typography
                                  variant="h5"
                                  sx={{ fontWeight: 500 }}
                                >
                                  Artista(s)
                                </Typography>
                              </TableCellName>
                              <TableCellValue title="Clique para copiar">
                                <Typography
                                  noWrap
                                  variant="h6"
                                  sx={{ fontWeight: 300, cursor: "pointer" }}
                                  onClick={() =>
                                    copyToClipboard(
                                      data.metadata.properties.creators
                                        .map((creator) => creator.address)
                                        .join(" ")
                                    )
                                  }
                                >
                                  {data.metadata.properties.creators[0].address}
                                  ({data.metadata.properties.creators.length})
                                </Typography>
                              </TableCellValue>
                            </TableRow>
                          )}
                        {data.metadata.seller_fee_basis_points !==
                          undefined && (
                          <TableRow>
                            <TableCellName>
                              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                                Royaties
                              </Typography>
                            </TableCellName>
                            <TableCellValue>
                              <Typography variant="h6" sx={{ fontWeight: 300 }}>
                                {data.metadata.seller_fee_basis_points / 100} %
                              </Typography>
                            </TableCellValue>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                {data.metadata.attributes && data.metadata.attributes !== [] && (
                  <Grid container spacing={1}>
                    {data.metadata.attributes.map((attribute, index) => (
                      <Grid item xs={6} sm={4}>
                        <Box
                          sx={{
                            border: (theme) =>
                              `2px solid ${theme.palette.primary.main}`,
                            borderRadius: 4,
                            padding: 2,
                          }}
                        >
                          <Typography variant="body1" color="#023047">
                            {attribute.trait_type}
                          </Typography>
                          <Typography variant="body1">
                            {attribute.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Card>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
