export type GeminiOptimizeAnkiDeckResponse =
    | {
          deck: Record<string, string>
          error?: never
      }
    | {
          deck?: never
          error: string
      }

// Success Example:
// {
//   deck: {
//         "Hello": "Hola",
//         "Goodbye": "Adiós",
//         "Thank you": "Gracias",
//   }
// }

// Error Example:
// {
//    error: "An error occurred while optimizing the deck"
// }
