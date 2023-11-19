import os
import requests

api_url = 'http://localhost:3008/master/verTabelas/Tecnologia da Informação'

response = requests.get(api_url)

if response.status_code == 200:
    dados_tabela = response.json()['uploads']

    table_body = ''
    for dado in dados_tabela:
        id = dado['id_upload']
        data = dado['data_criacao_upload']
        nome_arquivo = dado['nome_upload']
        download = dado['caminho_upload']
        template = dado['referencia_template']
        id_usuario = dado['referencia_usuario']
        nome_usuario = dado['referencia_nome']
        squad = dado['referencia_squad']
        diretorio = dado['diretorio']

        row = f'<tr><td>{id}</td><td>{data}</td><td>{nome_arquivo}</td><td>{download}</td><td>{template}</td><td>{id_usuario}</td><td>{nome_usuario}</td><td>{squad}</td><td>{diretorio}</td></tr>'

        table_body += row

    caminho_arquivo_html = os.path.join('C:\\Users\\980184\\Desktop\\QQtech\\BeaBa\\master\\dashboard\\templates', 'index.html')

    if os.path.exists(caminho_arquivo_html):
        with open(caminho_arquivo_html, 'r') as dashboard_html:
            conteudo_html = dashboard_html.read()

            marcador_tabela = '<!-- INSERIR_TABELA_AQUI -->'
            conteudo_html = conteudo_html.replace(marcador_tabela, table_body)

        with open('C:\\Users\\980184\\Desktop\\QQtech\\BeaBa\\master\\dashboard\\templates\\index_preenchido.html', 'w') as arquivo_html_preenchido:
            arquivo_html_preenchido.write(conteudo_html)

    else:
        print(f'Arquivo HTML não encontrado: {caminho_arquivo_html}')

else:
    print('Erro ao obter os dados da tabela:', response.status_code)
