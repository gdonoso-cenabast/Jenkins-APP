pipeline {
    agent any

    tools {
        nodejs 'node' // Hace referencia a la instalación configurada en Jenkins
    }

    stages {
        stage('Construcción (Build APP)') {
            steps {
                echo 'Compilando el proyecto Frontend con Vite...'
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Despliegue Local (Deploy)') {
            steps {
                echo 'Sincronizando archivos estáticos hacia Nginx...'
                // Borramos lo viejo y copiamos la nueva compilación a la carpeta compartida
                sh 'rm -rf /var/deploy/frontend/dist/*'
                sh 'cp -r dist/* /var/deploy/frontend/dist/'
                echo '¡Despliegue completado! Recarga tu navegador.'
            }
        }
    }
}
