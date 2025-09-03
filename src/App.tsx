import { Main } from './components/Main'
import Header from './components/Header'
import { ThemeProvider } from "@/components/ThemeProvider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen">
        <Header />
        <main>
          <Main />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
