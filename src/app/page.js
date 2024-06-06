"use client";

import { useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import axios from "axios";

export default function Home() {
  const [textPrompt, setTextPrompt] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        "/api",
        { textPrompt },
        { responseType: "blob" }
      );

      // const responseData = await response.json();
      console.log("PDF created", response.data);

      // read output.pdf
      // const url = "/output.pdf";
      // setPdfUrl(url);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ textAlign: "center", marginTop: "50px" }}>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>
          Multimodal PDF Generator
        </Typography>
        <TextField
          label="Enter text prompt"
          variant="outlined"
          fullWidth
          margin="normal"
          value={textPrompt}
          onChange={(e) => setTextPrompt(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={generatePDF}
          style={{ marginTop: "20px" }}
        >
          Generate PDF
        </Button>
      </Container>
      {loading && <Typography variant="body1">Loading...</Typography>}
      {!loading && pdfUrl && (
        <iframe
          src={pdfUrl}
          title="output-pdf"
          style={{ width: "100%", height: "600px", marginTop: "20px" }}
        ></iframe>
      )}
    </Container>
  );
}
