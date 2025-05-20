const cijene = {
  mali: "15€",
  srednji: "20€",
  veliki: "25€",
};

function inicijalizirajForme() {
  const forme = document.querySelectorAll(".narudzba-forma");

  forme.forEach((forma) => {
    const tipBuketa = forma.dataset.tip;
    const radioButtons = forma.querySelectorAll("input[type='radio']");
    const cijenaPrikaz = forma.querySelector(".cijena-prikaz");
    const datumInput = forma.querySelector(".datum-isporuke");
    const porukaTextarea = forma.querySelector("textarea");

    radioButtons.forEach((radio) => {
      radio.addEventListener("change", () => {
        cijenaPrikaz.textContent = `Cijena: ${cijene[radio.value]}`;
      });
    });

    forma.addEventListener("submit", function (e) {
      e.preventDefault();
      const odabrana = forma.querySelector("input[type='radio']:checked");
      const poruka = porukaTextarea.value.trim();
      const datum = datumInput.value;

      if (!odabrana) {
        alert("Molimo odaberite veličinu buketa.");
        return;
      }

      const danas = new Date().toISOString().split("T")[0];
      if (!datum || datum < danas) {
        alert("Molimo unesite ispravan datum isporuke.");
        return;
      }

      const dodatna = poruka !== "" ? poruka : "Nema dodatne poruke.";

      const narudzba = {
        buket: tipBuketa,
        velicina: odabrana.value,
        datum: datum,
        poruka: dodatna,
      };

      const postojece = JSON.parse(localStorage.getItem("narudzbe")) || [];
      postojece.push(narudzba);
      localStorage.setItem("narudzbe", JSON.stringify(postojece));

      sessionStorage.setItem("potvrda_narudzbe", JSON.stringify(narudzba));
      window.location.href = "potvrda.html";
    });
  });
}

function prikaziDodaneBukete() {
  const mjesto = document.getElementById("ponuda-container");
  if (!mjesto) return;

  const buketi = JSON.parse(localStorage.getItem("dodaniBuketi")) || [];

  buketi.forEach((buket, index) => {
    const div = document.createElement("div");
    div.classList.add("buket-kartica");
    div.innerHTML = `
      <img src="${buket.slika}" alt="${buket.naziv}" />
      <h3>${buket.naziv}</h3>
      <p>${buket.opis}</p>
      <form class="narudzba-forma" data-tip="${buket.naziv}">
        <label><strong>Odaberite veličinu:</strong></label>
        <div class="radio-grupa">
          <label><input type="radio" name="velicina${index}" value="mali" /> Mali</label>
          <label><input type="radio" name="velicina${index}" value="srednji" /> Srednji</label>
          <label><input type="radio" name="velicina${index}" value="veliki" /> Veliki</label>
        </div>
        <p class="cijena-prikaz"></p>
        <label>Datum isporuke:</label>
        <input type="date" class="datum-isporuke" required />
        <label>Dodatna poruka:</label>
        <textarea name="poruka" rows="2" placeholder="Vaša poruka..."></textarea>
        <button type="submit" class="btn-naruci">Naruči</button>
      </form>
    `;
    mjesto.appendChild(div);
  });
}

function dodajBuket() {
  const naziv = document.getElementById("naziv").value.trim();
  const opis = document.getElementById("opis").value.trim();
  const slika = document.getElementById("slika").value.trim();
  const poruka = document.getElementById("uspjeh-msg");

  if (!naziv || !opis || !slika) {
    alert("Molimo ispunite sva polja.");
    return;
  }

  const noviBuket = { naziv, opis, slika };

  const postojeći = JSON.parse(localStorage.getItem("dodaniBuketi")) || [];
  postojeći.push(noviBuket);
  localStorage.setItem("dodaniBuketi", JSON.stringify(postojeći));

  document.getElementById("naziv").value = "";
  document.getElementById("opis").value = "";
  document.getElementById("slika").value = "";

  poruka.style.display = "flex";
  setTimeout(() => {
    poruka.style.display = "none";
  }, 2000);

  prikaziAdmineBukete();
}

function prikaziAdmineBukete() {
  const adminLista = document.getElementById("admin-buketi-lista");
  if (!adminLista) return;

  const buketi = JSON.parse(localStorage.getItem("dodaniBuketi")) || [];
  adminLista.innerHTML = "";

  buketi.forEach((buket, index) => {
    const kartica = document.createElement("div");
    kartica.classList.add("admin-kartica");
    kartica.innerHTML = `
      <img src="${buket.slika}" alt="${buket.naziv}" />
      <h4>${buket.naziv}</h4>
      <p>${buket.opis}</p>
      <button class="btn-obrisi" onclick="obrisiBuket(${index})">Obriši buket</button>
    `;
    adminLista.appendChild(kartica);
  });
}

function obrisiBuket(index) {
  const buketi = JSON.parse(localStorage.getItem("dodaniBuketi")) || [];
  buketi.splice(index, 1);
  localStorage.setItem("dodaniBuketi", JSON.stringify(buketi));
  prikaziAdmineBukete();
}

function ucitajPotvrdu() {
  const podaci = sessionStorage.getItem("potvrda_narudzbe");
  if (!podaci) return;

  const { buket, velicina, datum, poruka } = JSON.parse(podaci);

  const elNaziv = document.getElementById("naziv");
  const elVelicina = document.getElementById("velicina");
  const elDatum = document.getElementById("datum");
  const elPoruka = document.getElementById("poruka");

  if (elNaziv) elNaziv.textContent = buket;
  if (elVelicina) elVelicina.textContent = velicina;
  if (elDatum) elDatum.textContent = datum;
  if (elPoruka) elPoruka.textContent = poruka;
}

function prikaziNarudzbeAdminu() {
  const mjesto = document.getElementById("narudzbe-lista");
  if (!mjesto) return;

  let narudzbe = JSON.parse(localStorage.getItem("narudzbe")) || [];

  const danas = new Date().toISOString().split("T")[0];
  narudzbe = narudzbe.filter((n) => n.datum >= danas);
  narudzbe.sort((a, b) => new Date(a.datum) - new Date(b.datum));

  mjesto.innerHTML = "";

  if (narudzbe.length === 0) {
    mjesto.innerHTML = "<p>Trenutno nema nadolazećih narudžbi.</p>";
    return;
  }

  narudzbe.forEach((n, i) => {
    const div = document.createElement("div");
    div.className = "admin-kartica";
    div.innerHTML = `
      <p><strong>Buket:</strong> ${n.buket}</p>
      <p><strong>Veličina:</strong> ${n.velicina}</p>
      <p><strong>Datum isporuke:</strong> ${n.datum}</p>
      <p><strong>Poruka:</strong> ${n.poruka}</p>
      <button class="btn-obrisi" onclick="obrisiNarudzbu(${i})">Obriši narudžbu</button>
    `;
    mjesto.appendChild(div);
  });
}

function obrisiNarudzbu(index) {
  const danas = new Date().toISOString().split("T")[0];
  const sveNarudzbe = JSON.parse(localStorage.getItem("narudzbe")) || [];
  const buduceNarudzbe = sveNarudzbe.filter((n) => n.datum >= danas);
  buduceNarudzbe.splice(index, 1);
  localStorage.setItem("narudzbe", JSON.stringify(buduceNarudzbe));
  prikaziNarudzbeAdminu();
}

document.addEventListener("DOMContentLoaded", () => {
  prikaziDodaneBukete();
  inicijalizirajForme();
  ucitajPotvrdu();
  prikaziNarudzbeAdminu();

  const kontaktForma = document.querySelector(".kontakt-forma");
  if (kontaktForma) {
    kontaktForma.addEventListener("submit", function (e) {
      e.preventDefault();

      const ime = document.getElementById("ime").value.trim();
      const email = document.getElementById("email").value.trim();
      const prigoda = document.getElementById("prigoda").value;
      const poruka = document.getElementById("poruka").value.trim();

      if (!ime || !email || !poruka) {
        alert("Molimo ispunite sva obavezna polja.");
        return;
      }

      emailjs
        .send(
          "service_c7xcz9g",
          "template_r92oqlg",
          {
            ime: ime,
            email: email,
            prigoda: prigoda,
            poruka: poruka,
          },
          "4YF4Ef599upUosNXq"
        )
        .then(() => {
          alert(`Hvala ${ime}! Vaša poruka je poslana.`);
          kontaktForma.reset();
        })
        .catch(() => {
          alert(
            "Došlo je do pogreške prilikom slanja poruke. Pokušajte ponovno."
          );
        });
    });
  }

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  const gumbPrijava = document.getElementById("gumb-prijava");
  if (gumbPrijava) {
    gumbPrijava.addEventListener("click", () => {
      const lozinka = document.getElementById("admin-password").value;
      const poruka = document.getElementById("poruka");

      if (lozinka === "cvjecarnica123") {
        document.getElementById("login-box").classList.add("hidden");
        document.getElementById("admin-sučeje").classList.remove("hidden");
        document.getElementById("admin-narudzbe").classList.remove("hidden");
        prikaziNarudzbeAdminu();
        prikaziAdmineBukete();
      } else {
        poruka.textContent = "Pogrešna lozinka. Pokušajte ponovno.";
      }
    });
  }
});
