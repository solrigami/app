import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletNftList } from "../../services/hooks/nft";
import GalleryCard from "../../components/GalleryCard";

export default function ListNFT() {
  const { publicKey } = useWallet();
  const data = useWalletNftList(publicKey);

  if (!publicKey) {
    return (
      <Container component="main" maxWidth="xl">
        <Box m={2} display="flex">
          <Typography
            display="inline-block"
            variant="h5"
            component="h3"
            gutterBottom
          >
            Connect Wallet!
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      component="main"
      maxWidth="xl"
      sx={{ padding: (theme) => `${theme.spacing(5)} !important` }}
    >
      <Typography
        color="primary"
        variant="h4"
        component="h2"
        gutterBottom
        sx={{
          textTransform: "uppercase",
          fontWeight: "500",
          marginBottom: (theme) => theme.spacing(4),
        }}
      >
        Meus Colecionáveis
      </Typography>
      <Box sx={{ display: "flex" }}>
        {data && (
          <Grid container spacing={3}>
            {data.map((nft, index) => (
              <Grid key={nft.name} item xs={12} sm={6} md={4} lg={3}>
                <GalleryCard
                  image={nft.image}
                  name={nft.name}
                  description={nft.description}
                  isNftListed={index % 2 === 0}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
