import Layout from "@/components/layout"

export default function Datenschutz() {
  return (
    <Layout>
      <div className="w-full max-w-3xl px-2">
        <div className="flex flex-col gap-2 px-12">
          <h1 className="text-lg font-bold">Datenschutz&shy;erkl&auml;rung</h1>
          <h2 className="font-bold">1. Datenschutz auf einen Blick</h2>
          <h3 className="font-semibold">Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen &Uuml;berblick
            dar&uuml;ber, was mit Ihren personenbezogenen Daten passiert, wenn
            Sie diese Website besuchen. Personenbezogene Daten sind alle Daten,
            mit denen Sie pers&ouml;nlich identifiziert werden k&ouml;nnen.
            Ausf&uuml;hrliche Informationen zum Thema Datenschutz entnehmen Sie
            unserer unter diesem Text aufgef&uuml;hrten
            Datenschutzerkl&auml;rung.
          </p>
          <h3 className="font-semibold">Datenerfassung auf dieser Website</h3>
          <h4>
            Wer ist verantwortlich f&uuml;r die Datenerfassung auf dieser
            Website?
          </h4>
          <p>
            Die Datenverarbeitung auf dieser Website erfolgt durch den
            Websitebetreiber. Dessen Kontaktdaten k&ouml;nnen Sie dem Abschnitt
            &bdquo;Hinweis zur Verantwortlichen Stelle&ldquo; in dieser
            Datenschutzerkl&auml;rung entnehmen.
          </p>
          <h4>Wie erfassen wir Ihre Daten?</h4>
          <p>
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese
            mitteilen, z.&nbsp;B. bei der Registrierung (E-Mail-Adresse, Name)
            und beim Beantworten der Fragen.
          </p>
          <p>
            Andere Daten werden automatisch oder nach Ihrer Einwilligung beim
            Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor
            allem technische Daten (z.&nbsp;B. Internetbrowser, Betriebssystem
            oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt
            automatisch, sobald Sie diese Website betreten.
          </p>
          <h4>Wof&uuml;r nutzen wir Ihre Daten?</h4>
          <p>
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung
            der Website zu gew&auml;hrleisten. Die &uuml;brigen Daten brauchen
            wir, damit Sie am Adventskalender teilnehmen k&ouml;nnen, Ihre
            Punkte in der Rangliste erscheinen und wir Ihnen wenige E-Mails zum
            Adventskalender schicken k&ouml;nnen (siehe Abschnitt 4). Ihr
            Nutzerverhalten werten wir nicht aus.
          </p>
          <h4>Welche Rechte haben Sie bez&uuml;glich Ihrer Daten?</h4>
          <p>
            Sie haben jederzeit das Recht, unentgeltlich Auskunft &uuml;ber
            Herkunft, Empf&auml;nger und Zweck Ihrer gespeicherten
            personenbezogenen Daten zu erhalten. Sie haben au&szlig;erdem ein
            Recht, die Berichtigung oder L&ouml;schung dieser Daten zu
            verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt
            haben, k&ouml;nnen Sie diese Einwilligung jederzeit f&uuml;r die
            Zukunft widerrufen. Au&szlig;erdem haben Sie das Recht, unter
            bestimmten Umst&auml;nden die Einschr&auml;nkung der Verarbeitung
            Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen
            ein Beschwerderecht bei der zust&auml;ndigen Aufsichtsbeh&ouml;rde
            zu.
          </p>
          <p>
            Hierzu sowie zu weiteren Fragen zum Thema Datenschutz k&ouml;nnen
            Sie sich jederzeit an uns wenden.
          </p>
          <h2 className="font-bold">2. Hosting und eingesetzte Dienste</h2>
          <p>
            Für den Betrieb des Adventskalenders nutzen wir die folgenden
            Anbieter. Sie verarbeiten die Daten ausschließlich in unserem
            Auftrag und nach unseren Weisungen (Auftragsverarbeitung nach Art.
            28 DSGVO).
          </p>
          <h3 className="font-semibold">Vercel (Hosting)</h3>
          <p>
            Die Website wird bei Vercel Inc., USA gehostet. Beim Aufruf der
            Website verarbeitet Vercel technisch notwendige Daten wie Ihre
            IP-Adresse, Datum und Uhrzeit des Aufrufs, die aufgerufene Seite und
            Informationen zu Browser und Betriebssystem (Server-Logfiles). Diese
            Logfiles werden nur kurzzeitig gespeichert.
          </p>
          <p>
            Weitere Informationen:{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://vercel.com/legal/privacy-policy
            </a>
          </p>
          <h3 className="font-semibold">
            Supabase (Benutzerkonten und Spielstände)
          </h3>
          <p>
            Benutzerkonten, Anmeldung und Spielstände verwalten wir mit Supabase
            (Supabase Inc., USA). Die Datenbank befindet sich in einem
            Rechenzentrum in der EU (Irland). Gespeichert werden die in
            Abschnitt 4 genannten Daten.
          </p>
          <p>
            Weitere Informationen:{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://supabase.com/privacy
            </a>
          </p>
          <h3 className="font-semibold">Sanity (Inhalte)</h3>
          <p>
            Die Fragen, Bilder und Audiodateien des Adventskalenders verwalten
            wir mit Sanity (Sanity AS, Norwegen). Bilder und Audiodateien werden
            beim Anzeigen bzw. Abspielen direkt von Servern von Sanity geladen;
            dabei wird Ihre IP-Adresse an Sanity übermittelt.
          </p>
          <p>
            Weitere Informationen:{" "}
            <a
              href="https://www.sanity.io/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.sanity.io/legal/privacy
            </a>
          </p>
          <h3 className="font-semibold">Resend (E-Mail-Versand)</h3>
          <p>
            E-Mails zur Anmeldung (Login-Code, Bestätigungs- und Passwort-Links)
            sowie die Erinnerung und die Gewinner-Nachricht zum Adventskalender
            versenden wir über Resend (Resend, Inc., USA). Dafür werden Ihre
            E-Mail-Adresse, Ihr Name und der Inhalt der E-Mail an Resend
            übermittelt.
          </p>
          <p>
            Weitere Informationen:{" "}
            <a
              href="https://resend.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://resend.com/legal/privacy-policy
            </a>
          </p>
          <h4>Rechtsgrundlage und Datenübermittlung in die USA</h4>
          <p>
            Der Einsatz dieser Dienste erfolgt auf Grundlage von Art. 6 Abs. 1
            lit. b DSGVO, soweit er für die Teilnahme am Adventskalender nötig
            ist, und im Übrigen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            Unser berechtigtes Interesse liegt in einem sicheren und
            zuverlässigen Betrieb der Website.
          </p>
          <p>
            Einige Anbieter haben ihren Sitz in den USA. Soweit dabei Daten in
            die USA übermittelt werden, erfolgt dies auf Grundlage des
            Angemessenheitsbeschlusses der EU-Kommission zum EU-US Data Privacy
            Framework, soweit der Anbieter danach zertifiziert ist, und im
            Übrigen auf Grundlage der Standardvertragsklauseln der
            EU-Kommission.
          </p>
          <h2 className="font-bold">
            3. Allgemeine Hinweise und Pflicht&shy;informationen
          </h2>
          <h3 className="font-semibold">Datenschutz</h3>
          <p>
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer
            pers&ouml;nlichen Daten sehr ernst. Wir behandeln Ihre
            personenbezogenen Daten vertraulich und entsprechend den
            gesetzlichen Datenschutzvorschriften sowie dieser
            Datenschutzerkl&auml;rung.
          </p>
          <p>
            Wenn Sie diese Website benutzen, werden verschiedene
            personenbezogene Daten erhoben. Personenbezogene Daten sind Daten,
            mit denen Sie pers&ouml;nlich identifiziert werden k&ouml;nnen. Die
            vorliegende Datenschutzerkl&auml;rung erl&auml;utert, welche Daten
            wir erheben und wof&uuml;r wir sie nutzen. Sie erl&auml;utert auch,
            wie und zu welchem Zweck das geschieht.
          </p>
          <p>
            Wir weisen darauf hin, dass die Daten&uuml;bertragung im Internet
            (z.&nbsp;B. bei der Kommunikation per E-Mail) Sicherheitsl&uuml;cken
            aufweisen kann. Ein l&uuml;ckenloser Schutz der Daten vor dem
            Zugriff durch Dritte ist nicht m&ouml;glich.
          </p>
          <h3 className="font-semibold">Hinweis zur verantwortlichen Stelle</h3>
          <p>
            Die verantwortliche Stelle f&uuml;r die Datenverarbeitung auf dieser
            Website ist:
          </p>
          <p>
            Adrian Burkhart
            <br />
            Lenauweg 1<br />
            21407 Deutsch Evern
          </p>
          <p>E-Mail: mail@adventskalender-haas.de</p>
          <p>
            Verantwortliche Stelle ist die nat&uuml;rliche oder juristische
            Person, die allein oder gemeinsam mit anderen &uuml;ber die Zwecke
            und Mittel der Verarbeitung von personenbezogenen Daten (z.&nbsp;B.
            Namen, E-Mail-Adressen o. &Auml;.) entscheidet.
          </p>
          <h3 className="font-semibold">Speicherdauer</h3>
          <p>
            Soweit innerhalb dieser Datenschutzerkl&auml;rung keine speziellere
            Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten
            bei uns, bis der Zweck f&uuml;r die Datenverarbeitung entf&auml;llt.
            Wenn Sie ein berechtigtes L&ouml;schersuchen geltend machen oder
            eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre
            Daten gel&ouml;scht, sofern wir keine anderen rechtlich
            zul&auml;ssigen Gr&uuml;nde f&uuml;r die Speicherung Ihrer
            personenbezogenen Daten haben (z.&nbsp;B. steuer- oder
            handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall
            erfolgt die L&ouml;schung nach Fortfall dieser Gr&uuml;nde.
          </p>
          <h3 className="font-semibold">
            Allgemeine Hinweise zu den Rechtsgrundlagen der Datenverarbeitung
            auf dieser Website
          </h3>
          <p>
            Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten
            wir Ihre personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1
            lit. a DSGVO bzw. Art. 9 Abs. 2 lit. a DSGVO, sofern besondere
            Datenkategorien nach Art. 9 Abs. 1 DSGVO verarbeitet werden. Im
            Falle einer ausdr&uuml;cklichen Einwilligung in die &Uuml;bertragung
            personenbezogener Daten in Drittstaaten erfolgt die
            Datenverarbeitung au&szlig;erdem auf Grundlage von Art. 49 Abs. 1
            lit. a DSGVO. Sofern Sie in die Speicherung von Cookies oder in den
            Zugriff auf Informationen in Ihr Endger&auml;t (z.&nbsp;B. via
            Device-Fingerprinting) eingewilligt haben, erfolgt die
            Datenverarbeitung zus&auml;tzlich auf Grundlage von &sect; 25 Abs. 1
            TDDDG. Die Einwilligung ist jederzeit widerrufbar. Sind Ihre Daten
            zur Vertragserf&uuml;llung oder zur Durchf&uuml;hrung
            vorvertraglicher Ma&szlig;nahmen erforderlich, verarbeiten wir Ihre
            Daten auf Grundlage des Art. 6 Abs. 1 lit. b DSGVO. Des Weiteren
            verarbeiten wir Ihre Daten, sofern diese zur Erf&uuml;llung einer
            rechtlichen Verpflichtung erforderlich sind auf Grundlage von Art. 6
            Abs. 1 lit. c DSGVO. Die Datenverarbeitung kann ferner auf Grundlage
            unseres berechtigten Interesses nach Art. 6 Abs. 1 lit. f DSGVO
            erfolgen. &Uuml;ber die jeweils im Einzelfall einschl&auml;gigen
            Rechtsgrundlagen wird in den folgenden Abs&auml;tzen dieser
            Datenschutzerkl&auml;rung informiert.
          </p>
          <h3 className="font-semibold">
            Empfänger von personenbezogenen Daten
          </h3>
          <p>
            Im Rahmen unserer Gesch&auml;ftst&auml;tigkeit arbeiten wir mit
            verschiedenen externen Stellen zusammen. Dabei ist teilweise auch
            eine &Uuml;bermittlung von personenbezogenen Daten an diese externen
            Stellen erforderlich. Wir geben personenbezogene Daten nur dann an
            externe Stellen weiter, wenn dies im Rahmen einer
            Vertragserf&uuml;llung erforderlich ist, wenn wir gesetzlich hierzu
            verpflichtet sind (z.&nbsp;B. Weitergabe von Daten an
            Steuerbeh&ouml;rden), wenn wir ein berechtigtes Interesse nach Art.
            6 Abs. 1 lit. f DSGVO an der Weitergabe haben oder wenn eine
            sonstige Rechtsgrundlage die Datenweitergabe erlaubt. Beim Einsatz
            von Auftragsverarbeitern geben wir personenbezogene Daten unserer
            Kunden nur auf Grundlage eines g&uuml;ltigen Vertrags &uuml;ber
            Auftragsverarbeitung weiter. Im Falle einer gemeinsamen Verarbeitung
            wird ein Vertrag &uuml;ber gemeinsame Verarbeitung geschlossen.
          </p>
          <h3 className="font-semibold">
            Widerruf Ihrer Einwilligung zur Datenverarbeitung
          </h3>
          <p>
            Viele Datenverarbeitungsvorg&auml;nge sind nur mit Ihrer
            ausdr&uuml;cklichen Einwilligung m&ouml;glich. Sie k&ouml;nnen eine
            bereits erteilte Einwilligung jederzeit widerrufen. Die
            Rechtm&auml;&szlig;igkeit der bis zum Widerruf erfolgten
            Datenverarbeitung bleibt vom Widerruf unber&uuml;hrt.
          </p>
          <h3 className="font-semibold">
            Widerspruchsrecht gegen die Datenerhebung in besonderen F&auml;llen
            sowie gegen Direktwerbung (Art. 21 DSGVO)
          </h3>
          <p>
            WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E
            ODER F DSGVO ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT, AUS
            GR&Uuml;NDEN, DIE SICH AUS IHRER BESONDEREN SITUATION ERGEBEN, GEGEN
            DIE VERARBEITUNG IHRER PERSONENBEZOGENEN DATEN WIDERSPRUCH
            EINZULEGEN; DIES GILT AUCH F&Uuml;R EIN AUF DIESE BESTIMMUNGEN
            GEST&Uuml;TZTES PROFILING. DIE JEWEILIGE RECHTSGRUNDLAGE, AUF DENEN
            EINE VERARBEITUNG BERUHT, ENTNEHMEN SIE DIESER
            DATENSCHUTZERKL&Auml;RUNG. WENN SIE WIDERSPRUCH EINLEGEN, WERDEN WIR
            IHRE BETROFFENEN PERSONENBEZOGENEN DATEN NICHT MEHR VERARBEITEN, ES
            SEI DENN, WIR K&Ouml;NNEN ZWINGENDE SCHUTZW&Uuml;RDIGE GR&Uuml;NDE
            F&Uuml;R DIE VERARBEITUNG NACHWEISEN, DIE IHRE INTERESSEN, RECHTE
            UND FREIHEITEN &Uuml;BERWIEGEN ODER DIE VERARBEITUNG DIENT DER
            GELTENDMACHUNG, AUS&Uuml;BUNG ODER VERTEIDIGUNG VON
            RECHTSANSPR&Uuml;CHEN (WIDERSPRUCH NACH ART. 21 ABS. 1 DSGVO).
          </p>
          <p>
            WERDEN IHRE PERSONENBEZOGENEN DATEN VERARBEITET, UM DIREKTWERBUNG ZU
            BETREIBEN, SO HABEN SIE DAS RECHT, JEDERZEIT WIDERSPRUCH GEGEN DIE
            VERARBEITUNG SIE BETREFFENDER PERSONENBEZOGENER DATEN ZUM ZWECKE
            DERARTIGER WERBUNG EINZULEGEN; DIES GILT AUCH F&Uuml;R DAS
            PROFILING, SOWEIT ES MIT SOLCHER DIREKTWERBUNG IN VERBINDUNG STEHT.
            WENN SIE WIDERSPRECHEN, WERDEN IHRE PERSONENBEZOGENEN DATEN
            ANSCHLIESSEND NICHT MEHR ZUM ZWECKE DER DIREKTWERBUNG VERWENDET
            (WIDERSPRUCH NACH ART. 21 ABS. 2 DSGVO).
          </p>
          <h3 className="font-semibold">
            Beschwerde&shy;recht bei der zust&auml;ndigen
            Aufsichts&shy;beh&ouml;rde
          </h3>
          <p>
            Im Falle von Verst&ouml;&szlig;en gegen die DSGVO steht den
            Betroffenen ein Beschwerderecht bei einer Aufsichtsbeh&ouml;rde,
            insbesondere in dem Mitgliedstaat ihres gew&ouml;hnlichen
            Aufenthalts, ihres Arbeitsplatzes oder des Orts des
            mutma&szlig;lichen Versto&szlig;es zu. Das Beschwerderecht besteht
            unbeschadet anderweitiger verwaltungsrechtlicher oder gerichtlicher
            Rechtsbehelfe.
          </p>
          <h3 className="font-semibold">
            Recht auf Daten&shy;&uuml;bertrag&shy;barkeit
          </h3>
          <p>
            Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung
            oder in Erf&uuml;llung eines Vertrags automatisiert verarbeiten, an
            sich oder an einen Dritten in einem g&auml;ngigen, maschinenlesbaren
            Format aush&auml;ndigen zu lassen. Sofern Sie die direkte
            &Uuml;bertragung der Daten an einen anderen Verantwortlichen
            verlangen, erfolgt dies nur, soweit es technisch machbar ist.
          </p>
          <h3 className="font-semibold">
            Auskunft, Berichtigung und L&ouml;schung
          </h3>
          <p>
            Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen
            jederzeit das Recht auf unentgeltliche Auskunft &uuml;ber Ihre
            gespeicherten personenbezogenen Daten, deren Herkunft und
            Empf&auml;nger und den Zweck der Datenverarbeitung und ggf. ein
            Recht auf Berichtigung oder L&ouml;schung dieser Daten. Hierzu sowie
            zu weiteren Fragen zum Thema personenbezogene Daten k&ouml;nnen Sie
            sich jederzeit an uns wenden.
          </p>
          <h3 className="font-semibold">
            Recht auf Einschr&auml;nkung der Verarbeitung
          </h3>
          <p>
            Sie haben das Recht, die Einschr&auml;nkung der Verarbeitung Ihrer
            personenbezogenen Daten zu verlangen. Hierzu k&ouml;nnen Sie sich
            jederzeit an uns wenden. Das Recht auf Einschr&auml;nkung der
            Verarbeitung besteht in folgenden F&auml;llen:
          </p>
          <ul>
            <li>
              Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten
              personenbezogenen Daten bestreiten, ben&ouml;tigen wir in der
              Regel Zeit, um dies zu &uuml;berpr&uuml;fen. F&uuml;r die Dauer
              der Pr&uuml;fung haben Sie das Recht, die Einschr&auml;nkung der
              Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
            </li>
            <li>
              Wenn die Verarbeitung Ihrer personenbezogenen Daten
              unrechtm&auml;&szlig;ig geschah/geschieht, k&ouml;nnen Sie statt
              der L&ouml;schung die Einschr&auml;nkung der Datenverarbeitung
              verlangen.
            </li>
            <li>
              Wenn wir Ihre personenbezogenen Daten nicht mehr ben&ouml;tigen,
              Sie sie jedoch zur Aus&uuml;bung, Verteidigung oder Geltendmachung
              von Rechtsanspr&uuml;chen ben&ouml;tigen, haben Sie das Recht,
              statt der L&ouml;schung die Einschr&auml;nkung der Verarbeitung
              Ihrer personenbezogenen Daten zu verlangen.
            </li>
            <li>
              Wenn Sie einen Widerspruch nach Art. 21 Abs. 1 DSGVO eingelegt
              haben, muss eine Abw&auml;gung zwischen Ihren und unseren
              Interessen vorgenommen werden. Solange noch nicht feststeht,
              wessen Interessen &uuml;berwiegen, haben Sie das Recht, die
              Einschr&auml;nkung der Verarbeitung Ihrer personenbezogenen Daten
              zu verlangen.
            </li>
          </ul>
          <p>
            Wenn Sie die Verarbeitung Ihrer personenbezogenen Daten
            eingeschr&auml;nkt haben, d&uuml;rfen diese Daten &ndash; von ihrer
            Speicherung abgesehen &ndash; nur mit Ihrer Einwilligung oder zur
            Geltendmachung, Aus&uuml;bung oder Verteidigung von
            Rechtsanspr&uuml;chen oder zum Schutz der Rechte einer anderen
            nat&uuml;rlichen oder juristischen Person oder aus Gr&uuml;nden
            eines wichtigen &ouml;ffentlichen Interesses der Europ&auml;ischen
            Union oder eines Mitgliedstaats verarbeitet werden.
          </p>
          <h3 className="font-semibold">SSL- bzw. TLS-Verschl&uuml;sselung</h3>
          <p>
            Diese Seite nutzt aus Sicherheitsgr&uuml;nden und zum Schutz der
            &Uuml;bertragung vertraulicher Inhalte, wie zum Beispiel
            Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber
            senden, eine SSL- bzw. TLS-Verschl&uuml;sselung. Eine
            verschl&uuml;sselte Verbindung erkennen Sie daran, dass die
            Adresszeile des Browsers von &bdquo;http://&ldquo; auf
            &bdquo;https://&ldquo; wechselt und an dem Schloss-Symbol in Ihrer
            Browserzeile.
          </p>
          <p>
            Wenn die SSL- bzw. TLS-Verschl&uuml;sselung aktiviert ist,
            k&ouml;nnen die Daten, die Sie an uns &uuml;bermitteln, nicht von
            Dritten mitgelesen werden.
          </p>
          <h2 className="font-bold">4. Datenerfassung auf dieser Website</h2>
          <h3 className="font-semibold">Benutzerkonto und Teilnahme</h3>
          <p>
            Um mitzuspielen, legen Sie ein Benutzerkonto an. Dabei verarbeiten
            wir:
          </p>
          <ul className="list-disc pl-6">
            <li>Ihre E-Mail-Adresse,</li>
            <li>Ihr Passwort (nur verschlüsselt als Hash gespeichert),</li>
            <li>
              den von Ihnen gewählten Namen, der in der Rangliste für andere
              angemeldete Teilnehmer sichtbar ist,
            </li>
            <li>
              Ihre Antworten mit Zeitpunkt, ob sie richtig waren, ob Sie die
              Seite während einer Frage verlassen haben, und Ihre Punkte.
            </li>
          </ul>
          <p>
            Die Rangliste (Name, Punkte, geöffnete Türchen) ist nur für
            angemeldete Teilnehmer sichtbar. Ihre E-Mail-Adresse sieht niemand
            außer uns.
          </p>
          <p>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Teilnahme am
            Adventskalender). Die Daten bleiben gespeichert, solange Ihr Konto
            besteht, damit Ihre Punkte auch in den folgenden Jahren in der
            Rangliste erscheinen. Wenn Sie Ihr Konto löschen lassen möchten,
            schreiben Sie uns eine E-Mail; dann löschen wir Ihr Konto und Ihre
            Spielstände.
          </p>
          <h3 className="font-semibold">E-Mails zur Anmeldung</h3>
          <p>
            Auf Ihre Anforderung schicken wir Ihnen E-Mails mit einem
            Login-Code, einem Link zum Bestätigen Ihrer E-Mail-Adresse oder zum
            Setzen eines neuen Passworts. Rechtsgrundlage ist Art. 6 Abs. 1 lit.
            b DSGVO. Werbung oder Newsletter verschicken wir nicht.
          </p>
          <h3 className="font-semibold">E-Mails zum Adventskalender</h3>
          <p>
            Außerdem schicken wir Teilnehmern höchstens zwei E-Mails pro Jahr:
          </p>
          <ul className="list-disc pl-6">
            <li>
              eine einmalige Erinnerung, wenn Sie in diesem Jahr schon ein
              Türchen geöffnet, danach aber fünf Türchen in Folge nicht mehr
              geöffnet haben (verschickt zwischen dem 6. und 28. Dezember),
            </li>
            <li>
              am 1. Januar eine Nachricht, wer den Adventskalender des
              vergangenen Jahres gewonnen hat, mit Ihren eigenen Punkten und
              Ihrem Platz. Sie geht an alle, die in dem Jahr mitgespielt haben.
            </li>
          </ul>
          <p>
            Dafür verwenden wir Ihre E-Mail-Adresse, Ihren Namen, den Zeitpunkt
            Ihrer geöffneten Türchen und Ihre Punkte. Damit jede E-Mail
            höchstens einmal verschickt wird, speichern wir, wann wir sie Ihnen
            geschickt haben; diese Einträge löschen wir zusammen mit Ihrem
            Konto.
          </p>
          <p>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes
            Interesse liegt darin, die Teilnehmer an das laufende Spiel zu
            erinnern und ihnen das Ergebnis mitzuteilen. Sie können dem
            jederzeit widersprechen: Eine kurze E-Mail an
            mail@adventskalender-haas.de genügt, dann bekommen Sie diese E-Mails
            nicht mehr.
          </p>
          <h3 className="font-semibold">Kommentare im Austausch</h3>
          <p>
            Auf der Seite „Austausch“ können Sie Kommentare schreiben. Wir
            speichern den Text, den Zeitpunkt und Ihr Konto. Andere angemeldete
            Teilnehmer sehen den Kommentar zusammen mit Ihrem Namen, sobald sie
            alle bisher geöffneten Türchen des Jahres beantwortet haben. Die
            Kommentare löschen wir zusammen mit Ihrem Konto, oder vorher, wenn
            Sie uns darum bitten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
            DSGVO.
          </p>
          <h3 className="font-semibold">Cookies</h3>
          <p>
            Wir verwenden ausschließlich technisch notwendige Cookies, damit Sie
            nach der Anmeldung eingeloggt bleiben. Diese Cookies enthalten Ihre
            Sitzungsdaten und bleiben gespeichert, bis Sie sich ausloggen oder
            die Sitzung abläuft. Die Speicherung erfolgt auf Grundlage von § 25
            Abs. 2 Nr. 2 TDDDG, da sie für den von Ihnen gewünschten Dienst
            unbedingt erforderlich ist; die weitere Verarbeitung erfolgt auf
            Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
          </p>
          <p>
            Wir setzen keine Analyse-, Tracking- oder Werbe-Cookies ein und
            binden keine Dienste Dritter zu diesen Zwecken ein.
          </p>
          <p>
            Sie können Ihren Browser so einstellen, dass Sie über das Setzen von
            Cookies informiert werden und Cookies nur im Einzelfall erlauben.
            Ohne Cookies ist eine Anmeldung allerdings nicht möglich.
          </p>
          <h3 className="font-semibold">Schriftarten</h3>
          <p>
            Die verwendeten Schriftarten sind lokal auf unserem Server
            gespeichert. Eine Verbindung zu Servern Dritter (z.&nbsp;B. Google)
            findet dabei nicht statt.
          </p>
          <p>
            Quelle:
            <a href="https://www.e-recht24.de">https://www.e-recht24.de</a>
          </p>
        </div>
      </div>
    </Layout>
  )
}
