# AI TV - Premium EdTech Learning Platform


A high-performance, modern React Native application built with **Expo SDK 54** for the "AI TV" EdTech Developer Assignment. This app features a premium light adaptive UI, seamless authentication, and course discovery with offline persistence.


---

## 1. Source Code & Quality Standards

- **Git Hygiene**: Organized with a clean, logical commit history.
- **Folder Structure**:
  - `app/`: File-based routing (Expo Router) for screens and navigation layouts.
  - `src/`: Core logic, including Context API, custom hooks, and API services.
  - `components/`: Atomic UI components, including themed views and custom inputs.
  - `constants/`: Design tokens, colors, and global theme configurations.
  - `assets/`: Optimized branding assets (Logo, Splash Screen).

---

## 2. Documentation

### Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Assignmt
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start Development Server**:
   ```bash
   npx expo start
   ```
4. **Run on Android**: Press `a` in the terminal (requires Android Studio/Emulator).

### Environment Variables & API
- **API Base URL**: `https://api.freeapi.app/api/v1`
- **Auth Endpoint**: `/users/login` | `/users/register`
- **Data Endpoint**: `/public/randomproducts` | `/public/randomusers`

### Key Architectural Decisions
- **Expo Router**: Implemented for robust, file-based navigation, enabling deep-linking and a clean screen hierarchy.
- **Context API & SecureStore**: Authentication state is managed via `AuthContext`, with JWT tokens stored securely using `expo-secure-store` to maintain sessions across reboots.
- **AsyncStorage Persistence**: User preferences, bookmarks, and learning statistics are persisted locally to ensure a seamless "instant-load" experience.
- **Axios Interceptors**: Global API client configured with interceptors to automatically attach Bearer tokens and handle refresh logic.

### Known Issues & Limitations
- **Offline Mode**: While core app state (stats/bookmarks) is persisted offline, the external course catalog requires a network connection to fetch new data from the API.
- **Mock Data**: Instructor profiles are procedurally matched to products from the public API for demonstration purposes.
<<<<<<< HEAD

---


### Build Instructions (EAS)
To generate a new build from source:
1. **Install EAS CLI**: `npm install -g eas-cli`
2. **Login to Expo**: `eas login`
3. **Configure Build**: `eas build:configure`
4. **Android APK**: `eas build -p android --profile preview`
=======
>>>>>>> 1e2656aadc36a8c55e667651a448b3c3eddb2323
