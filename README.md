# "Pako Narsulta" Phaser3 peli käyttäjä autentikaatiolla ja backend serverillä.
- [Linkki sovellukseen](https://aa3739-pako-narsulta.herokuapp.com/)
- Lähdekoodi on tämä repositorio. Älä kurkkaa .env filuun se oli pakko lisätä osaksi repoa että heroku toimisi.
- Tekijä: Matias Laakso AA3739
- Kurssi: Fullstack-ohjelmointi TTC2080-3011
- Kuvaus: Peli on on toteutettu Phaser3 moottorilla, ja sitä hostataan Node.js serverillä, jossa on useita ominaisuuksia.
- Työnjako: Yksin tehty, Mikael (AB7430) piirsi osan intro cutscenesta.
- Kulutettu aika: Ei montaa viikkoa mutta pitkiä päiviä kului tämän kanssa. Oma veikkaus 50-70h. Commiteista ei oikein ota ota selkoa, sillä rupesin repoa ylläpitämään vasta kun ajatus oli toteuttaa sovellus herokussa loppu päädyssä. Ennen tätä kuvittelin pystyttäväni tämän täysin student palvelimelle.

## Pääominaisuuksia:
1. Rekisteröityminen, kirjautuminen.
- Käyttäjä tiedot tallennetaan MongoDB tietokantaan
- Ennen sinne lähettämistä salasanat hashataan bcryptjs moduulilla, tietoturvan ylläpitämiseksi
- Kirjautuessaan käyttäjä saa jsonwebtokenin, ja pitkä kestoisemman refreshTokenin, joiden avulla käyttäjä pääsee serverin muille sivuille. 
- Jsonwebtoken on käyttäjä ja sessio kohtainen ja ilman sitä ainut sivu mihin serverillä pääsee on kirjautumis- ja forgot-password sivu.
2. Moduulit
- Projekti käyttää lukuisia moduulejaa mitä löysin tätä tarkoitusta varten kuten:
- Express, router toiminnallisuus
- Passport, Reittien suojaaminen
- JWT tai JSONWebToken, autentikaatio tarkoituksiin
- Cookie-parser, antaa kyvyn lisätä dataa cookie.headeriin, jota käytetään työssä tokenien noutamiseen
- AsyncMiddleware ei ole moduuli, mutta maininnan arvoinen kuitenkin, asyncronisesti ajaa kaikki pyynnöt ja antaa niille lupaukset
- Bcryptjs, salasanojen hashaus
- Mongoose, MongoDB yhteys
- UserSchemat myös maininnan arvoinen osa MongoDB prosessia, skeema runko mikä on ainut hyväksytty tapa ottaa yhteys tietokantaan.
3. Forgot Password.
- Jos käyttäjä on unohtanut salasanan, hän voi syöttää käyttäjätilin sähköpostin forgot password sivulle.
- Jos sähköposti löytyy tietokannasta, Nodemailer moduuli lähettää tilille sähköpostin joka sisältää reset-password sivulle linkin ja generoidun tokenin, joka on voimassa 10 minuuttia.
- Avatessaan linkin käyttäjä ohjataan reset password sivulle, jossa käyttäjän tulee syöttää kaksi kertaa uusi salasanansa.
- Tämän jälkeen uusi salasana lähetetään tietokantaan korvaamaan vanha. (Bcryptjs:än hashaamänä)

4. Pako Narsulta peli.
- Peli on yksinkertainen tasohyppely, jossa yritetään kerätä kolikoita ja välttää rotkoon putoamista.
- Pelin pohja on phaser3 virallisesta guidesta lainattu. Tämä runko osa on playGame scene. Sekään ei ole täysin puhtaana pysynyt, vaan muutoksia on siihenkin tehty. Kaikki muut scenet on pitkälti omia tuotoksia.
- Kun häviät pelissä, alkaa joko gameOver scene, tai Victory scene, riippuen kerättyjen kolikkojen määrästä.
- Tästä ruudusta pelaajalla on vaihtoehtona submitata pisteensä leaderboardille, tai siirtyä takaisin main menuun.
- Kun peli päättyy, ja siirtyy takaisin main menuun, koodi ajaa ajax get requestin tietokantaan, ja noutaa sieltä top 5 pisteet ja pelaajien nimet. Nämä tiedot tallennetaan array muuttujaan, josta ne luetaan myöhemmin.
- Main menusta pelaaja pystyy siirtymään Highscore sceneen, jossa top 5 pelaajien pisteet printataan arraysta.
- Pelaajan pisteiden submittaus tapahtuu kun pelaaja siirtyy victory tai gameOver scenestä main menuun valitsemalla submit score vaihtoehdon. Tämä ajaa submitScore funktion, joka syöttää sessionStoragesta ajax post requestin parametreiksi pelaajan sähköpostin, sekä pelissä ansaitut pisteet.
- Koodi tarkistaa onko käyttäjän sähköpostin jsonwebtoken voimassa, ja onko post parametrit user scheman mukaiset. Jos kaikki pitää paikkaansa, uusi pistemäärä lähetetään Mongo tietokantaan, ja se näkyy nyt seuraavan kerran leaderboardilla kun se kutsutaan.
