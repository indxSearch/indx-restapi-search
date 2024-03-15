import Search from "./Search"

export default function App() {
  return (
    <main>

      <div style={{ 
        maxWidth: '800px', 
        paddingTop: '60px',
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
        }}>

        <Search

          results={50}
          heap={0}
          algorithm={1} // 1 is Coverage, 0 is pure RelevancyRanking
          dataSet="My search demo"
          doTruncate={true} // cuts if Coverage algo detects full tokens

          />

      </div>

    </main>
  )
}
