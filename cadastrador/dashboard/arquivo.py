# Importe o módulo jsonify do Flask para retornar dados JSON
from flask import Flask, jsonify
import psycopg2
from decouple import config

app = Flask(__name__)

# Obtenha as variáveis de ambiente do arquivo .env
DATABASE_HOST = config('host')
DATABASE_NAME = config('db')
DATABASE_USER = config('user')
DATABASE_PASSWORD = config('passwd')

# Rota Flask para buscar arquivos enviados no banco de dados
@app.route('/buscar_arquivos', methods=['GET'])
def buscar_arquivos():
    try:
        # Conecte-se ao banco de dados e consulte os arquivos
        conn = psycopg2.connect(
            host=DATABASE_HOST,
            database=DATABASE_NAME,
            user=DATABASE_USER,
            password=DATABASE_PASSWORD
        )
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM \"BeaBa\".uploads")
        arquivos = cursor.fetchall()
        
        # Construa uma lista de dicionários com os resultados da consulta
        resultados = []
        for arquivo in arquivos:
            resultado = {
                "nome_upload": arquivo[1],
                "caminho_upload": arquivo[2],
                "data_criacao_upload": arquivo[3]
            }
            resultados.append(resultado)
        
        conn.close()
        
        # Retorne os resultados como JSON
        return jsonify(resultados)
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(port=5500)
