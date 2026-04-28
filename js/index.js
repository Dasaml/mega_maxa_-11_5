/**
 * 1. OVLÁDÁNÍ MENU (Hamburger)
 */
const menu = document.querySelector(".menu");
const menuItems = document.querySelectorAll(".menuItem");
const hamburger = document.querySelector(".hamburger");

const menuIcon = document.querySelector(".svg-menu");
const closeIcon = document.querySelector(".svg-menu-close");

function toggleMenu() {
    const isShowMenu = menu.classList.contains("showMenu");
    menu.classList.toggle("showMenu");
    
    if (isShowMenu) {
        closeIcon.style.display = "none";
        menuIcon.style.display = "block";
    } else {
        closeIcon.style.display = "block";
        menuIcon.style.display = "none";
    }
}

if (hamburger) {
    hamburger.addEventListener("click", toggleMenu);
}

menuItems.forEach(menuItem => {
    menuItem.addEventListener("click", toggleMenu);
});


/**
 * 2. CHYTRÝ ODPOČET
 */
function getNextDrawDay(now) {
    // Vstup: aktuální čas
    // Výstup: {drawDate, endOfDraw, isDrawDay, inDrawWindow}

    let day = now.getDay(); // 0 = neděle, 4 = čtvrtek
    let hour = now.getHours();
    let minute = now.getMinutes();

    // Helper: Najdi nejbližší čtvrtek nebo neděli (18:00)
    function getNextTargetDraw(targetDay) {
        let result = new Date(now);
        let add = (targetDay - day + 7) % 7;
        if (add === 0 && (hour > 19 || (hour === 19 && minute >= 35))) {
            add = 7; // už je po losování, posun na další týden
        }
        result.setDate(now.getDate() + add);
        result.setHours(18, 0, 0, 0); // vždy v 18:00
        return result;
    }

    let isDrawDay = (day === 0 || day === 4);
    let drawDate = null;
    let endOfDraw = null;
    let inDrawWindow = false;

    if (isDrawDay) {
        // Jsme ve čtvrtek nebo neděli – je okno aktivní?
        let start = new Date(now);
        start.setHours(18, 0, 0, 0);
        let end = new Date(now);
        end.setHours(19, 35, 0, 0);

        inDrawWindow = now >= start && now < end;
        drawDate = start;
        endOfDraw = end;

        if (!inDrawWindow && now >= end) {
            // po skončení losovacího okna, hledáme další losování
            if (day === 4) { // čtvrtek, další je neděle
                drawDate = getNextTargetDraw(0);
                endOfDraw = new Date(drawDate);
                endOfDraw.setHours(19, 35, 0, 0);
            } else { // neděle, další je čtvrtek
                drawDate = getNextTargetDraw(4);
                endOfDraw = new Date(drawDate);
                endOfDraw.setHours(19, 35, 0, 0);
            }
        }
    } else {
        // není čtvrtek ani neděle
        let nextTarget = (day < 4 || day > 0 && day < 4) ? 4 : 0;
        drawDate = getNextTargetDraw(nextTarget);
        endOfDraw = new Date(drawDate);
        endOfDraw.setHours(19, 35, 0, 0);
    }

    return {
        drawDate,
        endOfDraw,
        inDrawWindow
    };
}

function spustOdpocet() {
    setInterval(function() {
        const now = new Date();
        const {drawDate, endOfDraw, inDrawWindow} = getNextDrawDay(now);

        // Kam countdown směřuje
        let countdownTarget = inDrawWindow ? endOfDraw : drawDate;
        let rozdil = countdownTarget - now;

        // Správná hláška
        const message = inDrawWindow
            ? '<p class="title-h2">Výsledky za:</p>'
            : '<p class="title-h2">Další slosování za:</p>';

        const messageElement = document.querySelector('.flip-clock-message');
        if (messageElement) {
            messageElement.innerHTML = message;
        }

        // Pokud se countdown dostane do mínusu, neresetujeme, protože další cyklus to sám opraví
        if (rozdil < 0) rozdil = 0;

        const dny = Math.floor(rozdil / (1000 * 60 * 60 * 24));
        const hodiny = Math.floor((rozdil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minuty = Math.floor((rozdil % (1000 * 60 * 60)) / (1000 * 60));
        const vteriny = Math.floor((rozdil % (1000 * 60)) / 1000);

        const dnyEl = document.getElementById('dny');
        const hodinyEl = document.getElementById('hodiny');
        const minutyEl = document.getElementById('minuty');
        const vterinyEl = document.getElementById('vteriny');

        if (dnyEl) dnyEl.textContent = dny < 10 ? '0' + dny : dny;
        if (hodinyEl) hodinyEl.textContent = hodiny < 10 ? '0' + hodiny : hodiny;
        if (minutyEl) minutyEl.textContent = minuty < 10 ? '0' + minuty : minuty;
        if (vterinyEl) vterinyEl.textContent = vteriny < 10 ? '0' + vteriny : vteriny;
    }, 1000);
}

// Spuštění odpočtu
spustOdpocet();


/**
 * 3. UTM PARAMETRY A PIXEL (Z HTML KÓDU)
 */
// Function to get URL parameters as an object
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1); // Get the query string without the "?"
    const pairs = queryString.split("&");

    pairs.forEach(pair => {
        const [key, value] = pair.split("=");
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || "");
        }
    });

    return params;
}

// Function to insert a pixel with the extracted parameters
function insertPixel() {
    const params = getUrlParams();
    const pixelUrl = "https://www.maxa.cz/PartnerRedirectAction.do";


    // Extract specific parameters
    const PID = params.pid || "";
    const BID = params.bid || "";
    const SID = params.sid || "";
    const TID = params.tid || "";

    // Construct the pixel URL with the extracted parameters and noredir
    const pixelSrc = `${pixelUrl}?pid=${PID}&bid=${BID}&sid=${SID}&tid=${TID}&noredir=T`;

    // Create an image element for the pixel
    const pixel = document.createElement("img");
    pixel.src = pixelSrc;
    pixel.width = 1;
    pixel.height = 1;
    pixel.style.display = "none";

    // Append the pixel to the body
    document.body.appendChild(pixel);
}

// Call the function to insert the pixel
insertPixel();