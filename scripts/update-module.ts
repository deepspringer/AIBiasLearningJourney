
import { ALGORITHMIC_BIAS_TEXT } from "../client/src/constants/text-content";
import { storage } from "../server/storage";

async function updateModule() {
  try {
    await storage.updateModule(3, {
      text: ALGORITHMIC_BIAS_TEXT
    });
    console.log("Successfully updated module 3 with ALGORITHMIC_BIAS_TEXT");
  } catch (error) {
    console.error("Error updating module:", error);
  }
}

updateModule();
