# Klipr

**Klipr** is a desktop app for trimming and compressing video clips so they are easier to share on Discord, WhatsApp, email, social media, and other platforms with upload limits.

It was originally built for gameplay clips: select a local video, choose the exact moment you want to keep, set a target file size, and export a smaller MP4 ready to send.

[Download Klipr for Windows](https://github.com/caunaweber/Klipr/releases/latest)

## Why Klipr

Sharing clips is often blocked by file size limits. Klipr focuses on a direct workflow for that problem: load a clip, trim it, choose the final size, and compress it locally.

The app is designed for quick everyday use, but the project also explores desktop development concerns such as secure Electron IPC, local file handling, custom media preview, FFmpeg process management, and production packaging.

## What's New in 1.1.0

- Added Trim only export for cutting clips without recompressing them.
- Uses fast keyframe-based cutting for near-instant trim exports.
- Improved the custom video player layout and trim controls.
- Updated dependencies and resolved known npm audit vulnerabilities.

## Features

- Select local videos through file picker or drag and drop.
- Preview the selected video inside the app.
- Trim clips by choosing start and end points.
- Export a selected clip without compression.
- Set a target output size in MB.
- Choose between H.264 and H.265/HEVC compression.
- Optional 2-pass compression for better size/quality balance.
- Cancel an active compression.
- Open the output folder after export finishes.
- Supports MP4, MKV, and AVI input files.
- Exports compressed videos and trimmed clips as MP4.

## Technical Highlights

- Built with Electron, React, TypeScript, Vite, and Tailwind CSS.
- Uses FFmpeg and FFprobe for local video processing.
- Keeps file-system access in the Electron main process.
- Uses a preload bridge instead of exposing Node.js APIs to the renderer.
- Validates selected and dropped files before processing.
- Streams authorized video previews through a custom `video://` protocol.
- Tracks active FFmpeg processes to support cancellation and app shutdown cleanup.
- Packages a Windows installer with Electron Builder.

## Installation

Download the latest Windows installer from the Releases page:

[Klipr releases](https://github.com/caunaweber/Klipr/releases/latest)

For version 1.1.0, the installer file is:

```text
Klipr-Windows-1.1.0-Setup.exe
```

Run the setup file normally and launch Klipr after installation.

## Development

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Build the desktop app:

```bash
npm run build
```

The Windows installer is generated under:

```text
release/<version>/Klipr-Windows-<version>-Setup.exe
```

## Tech Stack

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- FFmpeg and FFprobe
- Electron Builder

## Privacy

Klipr processes videos locally on the user's machine. Selected files are not uploaded to an external server by the app.

---

# Klipr (Português)

**Klipr** é um aplicativo desktop para cortar e comprimir clipes de vídeo, facilitando o compartilhamento em plataformas como Discord, WhatsApp, e-mail, redes sociais e outros serviços com limite de upload.

O projeto nasceu principalmente para clipes de jogos: você seleciona um vídeo local, escolhe o trecho exato que quer manter, define o tamanho final desejado e exporta um MP4 menor, pronto para enviar.

[Baixar Klipr para Windows](https://github.com/caunaweber/Klipr/releases/latest)

## Por Que Klipr

Compartilhar clipes muitas vezes esbarra em limites de tamanho de arquivo. O Klipr foca em um fluxo direto para resolver esse problema: carregar o clipe, cortar o trecho desejado, escolher o tamanho final e comprimir localmente.

O app foi pensado para uso rápido no dia a dia, mas o projeto também trabalha pontos importantes de desenvolvimento desktop, como IPC seguro no Electron, manipulação de arquivos locais, preview customizado de mídia, gerenciamento de processos FFmpeg e empacotamento para produção.

## Novidades da Versão 1.1.0

- Adicionada exportação Trim only para cortar clipes sem recompressão.
- Uso de corte rápido baseado em keyframes para exportações quase instantâneas.
- Melhorias no layout do player customizado e nos controles de trim.
- Dependências atualizadas e vulnerabilidades conhecidas do npm audit resolvidas.

## Funcionalidades

- Seleção de vídeos locais pelo explorador de arquivos ou por drag and drop.
- Preview do vídeo selecionado dentro do app.
- Corte de clipes com definição de início e fim.
- Exportação do trecho selecionado sem compressão.
- Definição do tamanho final desejado em MB.
- Escolha entre compressão H.264 e H.265/HEVC.
- Compressão em 2 passes opcional para melhor equilíbrio entre tamanho e qualidade.
- Cancelamento de compressão em andamento.
- Botão para abrir a pasta do arquivo final após a exportação.
- Suporte a arquivos de entrada MP4, MKV e AVI.
- Exportação dos vídeos comprimidos e clipes cortados em MP4.

## Destaques Técnicos

- Desenvolvido com Electron, React, TypeScript, Vite e Tailwind CSS.
- Usa FFmpeg e FFprobe para processamento local de vídeo.
- Mantém o acesso ao sistema de arquivos no processo main do Electron.
- Usa preload bridge em vez de expor APIs Node.js ao renderer.
- Valida arquivos selecionados e recebidos por drag and drop antes do processamento.
- Faz streaming de previews autorizados por meio de um protocolo customizado `video://`.
- Rastreia processos FFmpeg ativos para permitir cancelamento e limpeza ao fechar o app.
- Gera instalador Windows com Electron Builder.

## Instalação

Baixe o instalador Windows mais recente pela página de Releases:

[Releases do Klipr](https://github.com/caunaweber/Klipr/releases/latest)

Para a versão 1.1.0, o arquivo do instalador é:

```text
Klipr-Windows-1.1.0-Setup.exe
```

Execute o arquivo de setup normalmente e abra o Klipr após a instalação.

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Execute em modo de desenvolvimento:

```bash
npm run dev
```

Execute o lint:

```bash
npm run lint
```

Gere a build do aplicativo desktop:

```bash
npm run build
```

O instalador para Windows é gerado em:

```text
release/<version>/Klipr-Windows-<version>-Setup.exe
```

## Tecnologias

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- FFmpeg e FFprobe
- Electron Builder

## Privacidade

O Klipr processa vídeos localmente na máquina do usuário. Os arquivos selecionados não são enviados para um servidor externo pelo aplicativo.
