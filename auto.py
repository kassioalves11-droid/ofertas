import time
import firebase_admin

from firebase_admin import credentials
from firebase_admin import firestore

from video_generator import gerar_video


# ==========================================
# FIREBASE
# ==========================================

cred = credentials.Certificate(
    "firebase-key.json"
)

firebase_admin.initialize_app(cred)

db = firestore.client()


print("\nAUTO STARTADO...\n")


# ==========================================
# LOOP PRINCIPAL
# ==========================================

while True:

    try:

        produtos = (

            db.collection("produtos")

            .where(
                "status",
                "==",
                "fila_video"
            )

            .stream()
        )


        encontrou = False


        for doc in produtos:

            encontrou = True

            produto = doc.to_dict()


            try:

                titulo = produto.get(
                    "titulo",
                    "Sem titulo"
                )


                print(
                    f"\nGERANDO: {titulo}"
                )


                # ==========================
                # STATUS GERANDO
                # ==========================

                doc.reference.update({

                    "status":

                    "gerando_video"
                })


                # ==========================
                # GERAR VIDEO
                # ==========================

                video_path = gerar_video(
                    produto
                )


                # ==========================
                # CAMINHO VIDEO LOCAL
                # ==========================

                nome_video = (

                    video_path

                    .replace("\\", "/")

                    .split("/")[-1]
                )


                caminho_video = (

                    "videos/"

                    + nome_video
                )


                # ==========================
                # VIDEO PRONTO
                # ==========================

                doc.reference.update({

                    "status":

                    "video_pronto",


                    "video":

                    caminho_video,


                    "videoUrl":

                    caminho_video
                })


                print(
                    f"\nVIDEO OK: {titulo}"
                )

                print(
                    f"\nCAMINHO VIDEO: {caminho_video}"
                )


            except Exception as erro:

                print(
                    f"\nERRO VIDEO: {erro}"
                )


                doc.reference.update({

                    "status":

                    "erro_render",


                    "erro":

                    str(erro)
                })


        if not encontrou:

            print(
                "Aguardando fila..."
            )


        time.sleep(5)


    except Exception as erro_geral:

        print(
            f"\nERRO GERAL: {erro_geral}"
        )

        time.sleep(5)