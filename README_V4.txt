PROJETO AFILIADOS V4

Esta pasta foi montada a partir de:
- projeto local completo
- versão limpa do GitHub/ofertas-main
- projeto_final antigo

O que foi preservado:
- Vitrine: index.html e pagina.html
- Painel: painel-produtos.html
- CSS e JS
- Videos publicados e videos locais úteis
- Gerador: auto.py, video_generator.py, captura_produto.py
- Produtos: produtos.json
- Músicas e imagens locais
- SaaS dashboard, se existia no projeto local

O que foi removido:
- .git antigo
- caches Python
- temp/
- saida/
- videos de teste: teste*.mp4 e viral_*.mp4
- backups e cópias antigas

IMPORTANTE:
- A chave Firebase foi colocada em LOCAL_PRIVADO_NAO_SUBIR/.
- Se o auto.py espera firebase-key.json na raiz, copie manualmente:
  LOCAL_PRIVADO_NAO_SUBIR/firebase-key.json
  para a raiz do projeto.
- Não envie LOCAL_PRIVADO_NAO_SUBIR para o GitHub.

Arquivos nesta V4: 73
Videos .mp4 em videos/: 46

Uso básico:
1. Abra o painel-produtos.html para cadastrar produtos.
2. Rode auto.py para gerar vídeos.
3. Depois rode publicar_videos.bat para publicar novos vídeos no GitHub.
4. Aguarde o GitHub Pages atualizar.
