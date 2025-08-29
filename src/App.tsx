import { From } from './components/Main'
import Header from './components/Header'
import { ThemeProvider } from "@/components/ThemeProvider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto p-8">
          <From />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
