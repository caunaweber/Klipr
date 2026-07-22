# Klipr

[English](README.md) | **Português**

**Klipr** é um aplicativo desktop para cortar e comprimir clipes de vídeo, facilitando o compartilhamento em plataformas como Discord, WhatsApp, e-mail, redes sociais e outros serviços com limite de upload.

O projeto nasceu principalmente para clipes de jogos: você seleciona um vídeo local, escolhe o trecho exato que quer manter, define o tamanho final desejado e exporta um MP4 menor, pronto para enviar.

[Baixar Klipr para Windows](https://github.com/caunaweber/Klipr/releases/latest)

## Por Que Klipr

Compartilhar clipes muitas vezes esbarra em limites de tamanho de arquivo. O Klipr oferece um fluxo direto para resolver esse problema: carregar o clipe, cortar o trecho desejado, escolher o tamanho e o FPS finais, selecionar um encoder disponível e comprimir localmente.

O app foi pensado para uso rápido no dia a dia, mas o projeto também trabalha pontos importantes de desenvolvimento desktop, como IPC seguro no Electron, manipulação de arquivos locais, preview customizado de mídia, gerenciamento de processos FFmpeg e empacotamento para produção.

## Novidades da Versão 1.2.0

- Adicionado encoding de vídeo por hardware com AMD AMF e NVIDIA NVENC.
- Detecção dos encoders disponíveis pelo FFmpeg ao iniciar o aplicativo, mostrando somente as opções compatíveis.
- Escolha do encoder mantida sob controle do usuário, com encoding por CPU sempre disponível.
- Adicionado controle do FPS de saída com as opções Nativo, 30 FPS, 60 FPS e 120 FPS.
- Adicionada integração **Abrir com Klipr** no Windows para os formatos de vídeo suportados.
- Adicionado tratamento claro de falhas de GPU pela notificação padrão do aplicativo.
- Adicionado um playhead sincronizado à linha do tempo de trim. Clicar no intervalo selecionado agora posiciona o preview sem mover os marcadores de início ou fim.
- Melhorada a estabilidade do preview durante seeks com previews MP4 temporários otimizados quando necessário.
- Compressão simplificada para um fluxo de passagem única.
- FFprobe atualizado para 6.1.1 e remoção de arquivos desnecessários do instalador Windows.

## Novidades da Versão 1.1.1

- Corrigido o título da janela/prévia na barra de tarefas do Windows, que ainda exibia o nome padrão do template Vite em vez de Klipr.
- Adicionado botão de maximizar/restaurar na title bar customizada.

## Novidades da Versão 1.1.0

- Adicionada exportação Trim only para cortar clipes sem recompressão.
- Uso de corte rápido baseado em keyframes para exportações quase instantâneas.
- Melhorias no layout do player customizado e nos controles de trim.
- Dependências atualizadas e vulnerabilidades conhecidas do npm audit resolvidas.

## Funcionalidades

- Seleção de vídeos locais pelo explorador de arquivos, por drag and drop ou por **Abrir com Klipr** no Windows.
- Preview do vídeo selecionado dentro do app.
- Acompanhamento da reprodução por um playhead sincronizado e seek direto pela linha do tempo de trim.
- Corte de clipes arrastando os marcadores de início e fim independentemente da posição do preview.
- Exportação do trecho selecionado sem compressão.
- Definição do tamanho final desejado em MB.
- Encoding AVC/H.264 ou HEVC/H.265 usando a CPU.
- Uso de AMD AMF ou NVIDIA NVENC quando hardware e drivers compatíveis são detectados.
- Manutenção do FPS original ou exportação em 30, 60 ou 120 FPS quando suportado pelo vídeo de origem.
- Cancelamento de compressão em andamento.
- Botão para abrir a pasta do arquivo final após a exportação.
- Suporte a arquivos de entrada MP4, MKV, MOV, WebM e AVI.
- Exportação dos vídeos comprimidos e clipes cortados em MP4.

## Previews Temporários de Vídeo

Alguns arquivos MP4 válidos armazenam seus metadados de navegação no final do arquivo, o que pode tornar seeks repetidos instáveis no Chromium. Quando o Klipr detecta essa estrutura, ele usa o FFmpeg para criar um preview otimizado no diretório temporário do sistema operacional.

- O preview é remontado com `faststart`; vídeo e áudio são copiados sem recodificação ou perda de qualidade.
- O vídeo de origem nunca é alterado e continua sendo a entrada das operações de trim e compressão.
- Arquivos MP4 que já estão otimizados, assim como os outros contêineres suportados, são reproduzidos diretamente sem criar uma cópia temporária.
- O preview temporário é removido quando outro vídeo é selecionado ou quando o Klipr fecha normalmente.
- Se um crash ou encerramento forçado deixar um preview para trás, o Klipr remove os arquivos residuais reconhecidos na próxima inicialização.

Toda a preparação e limpeza do preview acontece localmente. Os previews temporários não são enviados ou compartilhados pelo aplicativo.

## Encoding por GPU

O Klipr consulta o FFmpeg para descobrir quais encoders estão disponíveis no computador e valida os encoders de GPU antes de exibi-los. Os encoders de CPU permanecem disponíveis como opção segura.

- **AMD AMF:** requer GPU AMD e driver gráfico compatíveis.
- **NVIDIA NVENC:** requer GPU NVIDIA e driver gráfico compatíveis.
- A seleção da GPU é manual. O Klipr não troca silenciosamente de encoder se uma exportação por GPU falhar.

## Precisão do Tamanho Final

O tamanho selecionado é uma estimativa, não uma garantia exata do tamanho final. O controle de bitrate do encoder, a duração, o FPS, a complexidade das cenas, o áudio e o overhead do container podem fazer o arquivo ficar um pouco maior ou menor.

Para plataformas com limite rígido de upload, comece usando um target aproximadamente 1 MB abaixo do limite. Para vídeos longos, com FPS alto ou cenas muito dinâmicas, uma margem de 2–3 MB pode ser mais segura.

## Destaques Técnicos

- Desenvolvido com Electron, React, TypeScript, Vite e Tailwind CSS.
- Usa FFmpeg e FFprobe para processamento local de vídeo.
- Mantém o acesso ao sistema de arquivos no processo main do Electron.
- Usa preload bridge em vez de expor APIs Node.js ao renderer.
- Valida arquivos selecionados e recebidos por drag and drop antes do processamento.
- Disponibiliza somente previews registrados por meio de um protocolo customizado e autorizado `video://`.
- Detecta arquivos MP4 com metadados de navegação no final e prepara previews `faststart` descartáveis sem recodificação.
- Mantém separado o caminho descartável do preview e o arquivo original usado nas operações de trim e compressão.
- Rastreia processos FFmpeg ativos para permitir cancelamento e limpeza ao fechar o app.
- Gera um instalador Windows x64 com Electron Builder.

## Instalação

Baixe o instalador Windows mais recente pela página de Releases:

[Releases do Klipr](https://github.com/caunaweber/Klipr/releases/latest)

Para a versão 1.2.0, o arquivo do instalador é:

```text
Klipr-Windows-1.2.0-Setup.exe
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

Execute os testes:

```bash
npm test
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
