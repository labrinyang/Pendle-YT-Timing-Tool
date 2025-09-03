import { Main } from './components/Main'
import Header from './components/Header'
import { ThemeProvider } from "@/components/ThemeProvider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto p-4 sm:p-8">
          <Main />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
