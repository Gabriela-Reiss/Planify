📌 Planify

Planify é um aplicativo de gerenciamento de tarefas desenvolvido em React Native com integração ao Firebase e suporte a múltiplas funcionalidades modernas, como login persistente, temas dinâmicos, notificações locais e internacionalização.


🚀 Funcionalidades

✅ Autenticação com Google e E-mail via Firebase
✅ Login persistente (auto-login)
✅ Armazenamento de tarefas no Firestore, por usuário
✅ Lista de tarefas com sincronização em tempo real
✅ Tema claro/escuro com persistência (AsyncStorage)
✅ Internacionalização (i18n): suporte a PT/EN com troca dinâmica de idioma
✅ Notificações locais com agendamento por data/hora
✅ Integração com API externa via TanStack Query (ex.: frases motivacionais)


📂 Estrutura do Projeto

Planify/
├── app/
│   ├── _layout.tsx          # Estrutura principal de layout
│   ├── Home.tsx             # Tela principal com lista de tarefas
│   ├── index.tsx            # Tela inicial / login
│   ├── NewPassword.tsx      # Tela de redefinição de senha
│   └── ScreemRegister.tsx   # Tela de registro de usuário
│
├── assets/                  # Ícones e imagens do app
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── google-logo.png
│   ├── icon.png
│   ├── logo-planify.png
│   └── splash-icon.png
│
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ContextThemeButton.tsx
│   │   └── TaskCard.tsx
│   │
│   ├── configurations/      # Configurações principais
│   │   ├── firebaseConfig.tsx
│   │   ├── googleConfig.ts
│   │   └── i18nConfig.ts
│   │
│   ├── context/             # Contextos globais
│   │   └── ContextTheme.jsx
│   │
│   └── languages/           # Arquivos de internacionalização
│       ├── en.json
│       └── pt.json
│
├── app.json                 # Configurações Expo
├── eas.json                 # Configuração do build (Expo EAS)
├── package.json             # Dependências e scripts
├── package-lock.json
└── tsconfig.json            # Configurações TypeScript


🛠️ Tecnologias e Bibliotecas

React Native + Expo
Firebase
@react-native-firebase/app
@react-native-firebase/auth
@react-native-firebase/firestore
Navegação: @react-navigation/native
UI: react-native-paper ou native-base
Internacionalização: i18n-js + arquivos en.json e pt.json
Notificações: expo-notifications
TanStack Query: @tanstack/react-query


📱 Como Executar o Projeto

Clone este repositório:
git clone https://github.com/usuario/Planify.git

Acesse a pasta do projeto:
cd Planify

Instale as dependências:
npm install

Inicie o app:
npx expo start


🎥 Demonstração
📌 https://github.com/user-attachments/assets/cf8a9d68-097d-4289-a301-98de371c8106



👨‍💻 Integrantes

Gabriela de Sousa Reis - RM558830
Laura Amadeu Soares - RM556690
Raphael Lamaison Kim - RM557914
