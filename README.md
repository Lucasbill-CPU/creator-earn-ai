# creator-earn-ai

CreatorEarn AI is a mobile MVP for discovering and evaluating business ideas with realistic earnings potential. It is designed as an Expo app that can be packaged for iOS and Android using EAS Build and submitted to the App Store when the app has been properly signed and connected to Apple App Store Connect.

What the app includes
- Idea discovery flow with category-based prompts
- Saved idea dashboard with status tracking and editable fields
- Revenue estimate calculations and opportunity scoring
- Local persistence using AsyncStorage
- Credit purchase flow for premium insights
- A ready-to-extend workflow for native billing integration

Recommended monetization path
- Sell credit packs for premium idea analysis
- Offer a paid premium plan for advanced AI insight reports
- Add a creator marketplace or agency campaign workflow later

Run locally
1. Install dependencies:
   npm install
2. Start Expo:
   npm start
3. Open in an iOS simulator or Android emulator

App Store / publish flow
1. Install EAS CLI:
   npm install -g eas-cli
2. Log in:
   eas login
3. Configure your app identifiers in Apple Developer and Google Play:
   - iOS bundle ID: com.creator.earn.ai
   - Android package: com.creator.earn.ai
4. Build the app:
   eas build --platform ios
5. Submit via App Store Connect after architecture and signing are complete.

Production notes
- This app currently uses demo credit purchase UX and local storage.
- For actual commercial monetization, integrate RevenueCat or native StoreKit/Google Play billing before release.
- Replace the simulated enterprise logic with a real backend when your product grows.
