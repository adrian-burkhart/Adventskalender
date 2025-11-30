import Layout from "@/components/layout"

export default function Impressum() {
  return (
    <Layout>
      <main>
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-bold">Impressum</h1>

          <h2 className="font-bold">Angaben gem&auml;&szlig; &sect; 5 TMG</h2>
          <p>
            Adrian Burkhart
            <br />
            Lenauweg 1<br />
            21407 Deutsch Evern
          </p>

          <h2 className="font-bold">Kontakt</h2>
          <p>E-Mail: mail@adventskalender-haas.de</p>
        </div>
      </main>
    </Layout>
  )
}
