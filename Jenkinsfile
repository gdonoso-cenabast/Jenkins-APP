pipeline {
    agent any

    stages {
        stage('Construcción (Build APP)') {
            steps {
                echo 'Compilando el proyecto Frontend...'
                // sh 'npm install'
                // sh 'npm run build'
            }
        }
        
        stage('Análisis de Calidad (SonarQube)') {
            steps {
                echo 'Ejecutando análisis de SonarQube para el Frontend...'
            }
        }
        
        stage('Despliegue') {
            steps {
                echo 'Copiando archivos estáticos y reiniciando Frontend...'
            }
        }
    }
}
