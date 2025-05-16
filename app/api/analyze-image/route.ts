import axios from 'axios';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

import { ImageAnnotatorClient } from '@google-cloud/vision';

// Caminho absoluto para o arquivo de credenciais

const credentialsPath = "C:\\waxcloud-creds\\google-credentials.json";
const credentialsTokenDiscogs = "C:\\waxcloud-creds\\discogs-credentials.json";

const credentialsPath2 =
  "/Users/allanpinheiro/Downloads/google-credentials.json";
const credentialsTokenDiscogs2 =
  "/Users/allanpinheiro/Downloads/discogs-credentials.json";

// Verifica se o arquivo existe
if (!fs.existsSync(credentialsPath) && !fs.existsSync(credentialsPath2)) {
  console.error("Arquivo de credenciais não encontrado:", credentialsPath);
  console.error("Arquivo de credenciais não encontrado:", credentialsPath2);
  throw new Error("Arquivo de credenciais do Google Cloud não encontrado");
}

// Lê e verifica o conteúdo do arquivo de credenciais
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
} catch (error) {
  credentials = JSON.parse(fs.readFileSync(credentialsPath2, "utf8"));
}

// Inicializa o cliente do Vision API com as credenciais
const vision = new ImageAnnotatorClient({
  credentials,
  projectId: credentials.project_id,
});

async function extractTextFromImage(buffer: Buffer) {
  try {
    // OCR com Vision API
    const [textResult] = await vision.textDetection({
      image: { content: buffer },
    });
    const detectedText = textResult.textAnnotations?.[0]?.description || "";
    const lines = detectedText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    // Remover linhas que são só números (ano)
    const yearRegex = /19\d{2}|20\d{2}/;
    let year = "";
    let filteredLines = [];
    for (const line of lines) {
      const match = line.match(yearRegex);
      if (match) {
        year = match[0];
      } else {
        filteredLines.push(line);
      }
    }

    // Heurística: se houver separador, dividir
    let artist = "";
    let album = "";
    if (filteredLines.length === 1) {
      const parts = filteredLines[0].split(/[-–:|]/);
      if (parts.length === 2) {
        artist = parts[0].trim();
        album = parts[1].trim();
      } else {
        artist = filteredLines[0];
      }
    } else if (filteredLines.length >= 2) {
      // O maior texto é o artista, o segundo maior é o álbum
      const sorted = [...filteredLines].sort((a, b) => b.length - a.length);
      artist = sorted[0];
      album = sorted[1] || "";
    }

    // Usar o Vision API para labels também
    const [labelResult] = await vision.labelDetection({
      image: { content: buffer },
    });
    const labels = labelResult.labelAnnotations || [];
    const musicLabels = labels
      .filter((label) => {
        const desc = label.description?.toLowerCase() || "";
        return (
          desc.includes("music") ||
          desc.includes("album") ||
          desc.includes("vinyl") ||
          desc.includes("record") ||
          desc.includes("cd") ||
          desc.includes("audio") ||
          desc.includes("cover") ||
          desc.includes("band") ||
          desc.includes("song")
        );
      })
      .map((label) => label.description);

    const result = {
      artist,
      album,
      year,
      labels: musicLabels,
    };

    console.log("Resultado final:", result); // Debug

    if (!artist && !album) {
      // Nenhum texto detectado, retorne erro ou mensagem especial
      return {
        artist: "",
        album: "",
        year: "",
        labels: musicLabels,
        warning:
          "Nenhum texto detectado na imagem. Não é possível identificar automaticamente.",
      };
    }

    const firstFindDiscogs = await searchDiscogs(result.artist, result.album);
    console.log({ firstFindDiscogs });

    return { ...result, ...firstFindDiscogs };
  } catch (error) {
    console.error("Erro na extração de texto:", error);
    throw error;
  }
}

async function searchDiscogs(artist: string, album: string) {
  const url = "https://api.discogs.com/database/search";

  // Lê e verifica o conteúdo do arquivo de credenciais
  let token;
  try {
    token = JSON.parse(fs.readFileSync(credentialsTokenDiscogs, "utf8"));
  } catch (error) {
    token = JSON.parse(fs.readFileSync(credentialsTokenDiscogs2, "utf8"));
  }

  try {
    const response = await axios.get(url, {
      params: {
        artist: artist,
        release_title: album,
        type: "release",
        token: token.token,
      },
    });

    const results = response.data.results;

    if (results.length === 0) {
      console.log("No results found.");
      return;
    }

    return results[0]; // Retorna o primeiro resultado
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching from Discogs:", error.message);
    } else {
      console.error("Error fetching from Discogs:", String(error));
    }
  }
}

export async function POST(request: Request) {
  try {
    // Log do recebimento da requisição
    console.log("Recebendo requisição de análise de imagem");

    // Ler o corpo da requisição como FormData
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      console.error("Nenhum arquivo recebido");
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Log do arquivo recebido
    console.log("Arquivo recebido:", file);

    // Verifica se o arquivo é um Blob (File)
    if (!(file instanceof Blob)) {
      console.error("O arquivo recebido não é um Blob");
      return NextResponse.json(
        { success: false, error: "Arquivo inválido" },
        { status: 400 }
      );
    }

    // Ler o buffer do arquivo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Log do tamanho do buffer
    console.log("Tamanho do buffer:", buffer.length);

    // Extrair informações da imagem
    const result = await extractTextFromImage(buffer);

    // Log do resultado final
    console.log("Resultado da análise:", result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar a imagem",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
