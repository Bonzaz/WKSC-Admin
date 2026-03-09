const hostName = window.location.hostname;
const isOnProduction = hostName.includes("github");

const redirectToLoginPage = () => {
    localStorage.clear();
    if (isOnProduction) {
        const splittedPath = window.location.pathname.split("/");
        const repoName = splittedPath[1];
        window.location.href = window.location.origin + "/" + repoName + "/index.html";
    } else {
        window.location.href = window.location.origin + "/index.html";
    }
}

const isLoggedIn = localStorage.getItem("loggedInAs") && localStorage.getItem("tokenId") && localStorage.getItem("loggedInTimeStamp");
if (!isLoggedIn) {
    redirectToLoginPage();
};

const DURATION = 3 * 24 * 60 * 60 * 1000;
const timestamp = parseInt(localStorage.getItem("loggedInTimeStamp"));
const timelimit = timestamp + DURATION;

if (timelimit < Date.now()) {
    redirectToLoginPage();
};