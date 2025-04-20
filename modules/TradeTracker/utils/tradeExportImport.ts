import { TradeRecord } from "../components/TradeTable/types";

/**
 * Export trades to a JSON file
 * @param trades Array of trade records to export
 * @param filename Optional filename (defaults to 'trades-export-{date}.json')
 */
export const exportTrades = (trades: TradeRecord[], filename?: string): void => {
  if (!trades.length) {
    alert("No trades to export");
    return;
  }

  try {
    // Create a JSON string with the trades data
    const dataStr = JSON.stringify(trades, null, 2);

    // Create a blob with the data
    const blob = new Blob([dataStr], { type: "application/json" });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");

    // Set the link's attributes
    link.href = url;
    link.download = filename || `trades-export-${new Date().toISOString().split("T")[0]}.json`;

    // Append the link to the body
    document.body.appendChild(link);

    // Click the link to trigger the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);

    // Revoke the URL to free up memory
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting trades:", error);
    alert("Failed to export trades");
  }
};

/**
 * Import trades from a JSON file
 * @returns Promise that resolves to an array of trade records
 */
export const importTrades = (): Promise<TradeRecord[]> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a file input element
      const input = document.createElement("input");

      // Set the input's attributes
      input.type = "file";
      input.accept = "application/json";

      // Add an event listener for when a file is selected
      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          reject(new Error("No file selected"));
          return;
        }

        // Create a file reader
        const reader = new FileReader();

        // Add an event listener for when the file is loaded
        reader.onload = (e) => {
          try {
            const result = e.target?.result;

            if (typeof result !== "string") {
              reject(new Error("Invalid file format"));
              return;
            }

            // Parse the JSON data
            const trades = JSON.parse(result) as TradeRecord[];

            // Validate the trades data
            if (!Array.isArray(trades)) {
              reject(new Error("Invalid trades data: not an array"));
              return;
            }

            // Check if each item has the required fields
            const isValid = trades.every(
              (trade) =>
                typeof trade === "object" &&
                trade !== null &&
                "id" in trade &&
                "symbol" in trade &&
                "entryPrice" in trade
            );

            if (!isValid) {
              reject(new Error("Invalid trades data: missing required fields"));
              return;
            }

            resolve(trades);
          } catch (error) {
            reject(new Error("Failed to parse trades data"));
          }
        };

        // Add an event listener for errors
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        // Read the file as text
        reader.readAsText(file);
      };

      // Click the input to open the file dialog
      input.click();
    } catch (error) {
      reject(error);
    }
  });
};
