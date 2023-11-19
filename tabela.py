# from flask import Flask, jsonify
# from decouple import config
# import psycopg2

# app = Flask(__name)

# @app.route('/get_data')
# def get_data():
#     # Conecta ao banco de dados e busca os dados
#     connection = psycopg2.connect(
#         host=config('host'),
#         dbname=config('db'),
#         port=config('port'),
#         user=config('user'),
#         password=config('passwd')
#     )
#     cursor = connection.cursor()

#     query = '''SELECT "tipo_acesso", COUNT(*) AS "Contagem"
#                FROM "BeaBa"."usuarios"
#                GROUP BY "tipo_acesso"'''
#     cursor.execute(query)

#     data = [{'tipo_acesso': row[0], 'contagem': row[1]} for row in cursor.fetchall()]

#     connection.close()

#     return jsonify(data)

# if __name__ == '__main__':
#     app.run()

from flask import Flask, request, send_file, render_template
import io
import openpyxl

app = Flask(__name__, template_folder='templates', static_folder='static')


@app.route('/dashboard')
def cliente():
    return render_template('index.html')

@app.route('/usuarios')
def cliente():
    return render_template('index.html')

@app.route('/gerar-tabela-cliente', methods=['POST'])
def gerar_tabela_cliente():
    data = request.get_json()

    workbook = openpyxl.Workbook()
    sheet = workbook.active

    sheet.append(["Nome", "Data de Nascimento", "CPF", "Origem", "Score"])

    # Preencher a tabela com os dados dos clientes
    for cliente in data:
        sheet.append([cliente["nomeCompleto"], cliente["dataNascimento"], cliente["CPF"], cliente["origem"], cliente["score"]])

    output = io.BytesIO()
    workbook.save(output)
    output.seek(0)

    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='tabela_clientes.xlsx'
    )

if __name__ == '__main__':
    app.run()

