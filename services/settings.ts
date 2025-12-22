export const settingsService = {
  getSettings: async () => {
    return {
      globalFallbackMessage: "Sorry, I didn't understand. Can you repeat?",
      adminPhone: "5511999999999"
    };
  },
  
  updateSettings: async (settings: any) => {
    console.log('Settings updated', settings);
  }
};
