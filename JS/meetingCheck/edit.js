// Elements
const title = document.getElementById("h1-header");
const goToCalendar = document.getElementById("goTo-Calendar");
const goToSheet = document.getElementById("goTo-Sheet");
const eventStart = document.getElementById("eventStart-Time");
const eventEnd = document.getElementById("eventEnd-Time");

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");

const mainTag = document.querySelector('main');
const checked = document.querySelector('.checked');
const unchecked = document.querySelector('.unchecked');
const loadingUser = document.getElementById("loading-user");

const actionButtons = document.getElementById("actionButtons");
const saveBtn = document.getElementById("saveBtn");
const discardBtn = document.getElementById("discardBtn");

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyYw95we2MSsR-s-lnWNGkjx70F4AKbNrNGOFZdvhZimTpQ9qbmm7CcVSnSQttyCfHe/exec";

title.textContent = "กำลังโหลด...";
searchInput.disabled = true;
checked.style.display = "none";
unchecked.style.display = "none";

let allUsers = [];
let checkedUsers = [];
let uncheckedUsers = [];
let initialCheckedUsers = [];
let initialUncheckedUsers = [];
let saving = false;

function checkChanges() {
    const isChanged = JSON.stringify(checkedUsers) !== JSON.stringify(initialCheckedUsers);
    if (isChanged) {
        actionButtons.classList.add("visible");
    } else {
        actionButtons.classList.remove("visible");
    }
}

function renderUsers() {
    const checkedContainer = checked.querySelector(".checkedUsers");
    const uncheckedContainer = unchecked.querySelector(".uncheckedUsers");

    checkedContainer.innerHTML = "";
    uncheckedContainer.innerHTML = "";

    if (checkedUsers.length === 0) {
        const placeholder = document.createElement("div");
        placeholder.className = "user user-placeholder";
        placeholder.textContent = "ยังไม่มีรายชื่อที่เช็กแล้ว";
        checkedContainer.appendChild(placeholder);
    } else {
        checkedUsers.forEach((user, index) => {
            const ol = document.createElement("ol");
            const template = `<li class="user">
                        <div class="left">
                            <h3></h3>
                            <p></p>
                        </div>
                        <div class="right">
                            <button class="remove-btn">- นำออก</button>
                        </div>
                    </li>`;
            ol.innerHTML = template;
            ol.querySelector(".left h3").textContent = user[0];
            ol.querySelector(".left p").textContent = user[3] + "@wk.ac.th";
            ol.querySelector(".remove-btn").addEventListener("click", () => {
                if (saving) return;
                const movedUser = checkedUsers.splice(index, 1)[0];
                uncheckedUsers.push(movedUser);
                uncheckedUsers.sort((a, b) => a[0].localeCompare(b[0]));
                renderUsers();
                checkChanges();
            });
            checkedContainer.appendChild(ol);
        });
    }

    if (uncheckedUsers.length === 0) {
        const placeholder = document.createElement("div");
        placeholder.className = "user user-placeholder";
        placeholder.textContent = "ไม่มีรายชื่อที่ยังไม่ได้เช็ก";
        uncheckedContainer.appendChild(placeholder);
    } else {
        uncheckedUsers.forEach((user, index) => {
            const ol = document.createElement("ol");
            const template = `<li class="user">
                        <div class="left">
                            <h3></h3>
                            <p></p>
                        </div>
                        <div class="right">
                            <button class="add-btn">+ เช็กชื่อ</button>
                        </div>
                    </li>`;
            ol.innerHTML = template;
            ol.querySelector(".left h3").textContent = user[0];
            ol.querySelector(".left p").textContent = user[3] + "@wk.ac.th";
            ol.querySelector(".add-btn").addEventListener("click", () => {
                if (saving) return;
                const movedUser = uncheckedUsers.splice(index, 1)[0];
                checkedUsers.push(movedUser);
                checkedUsers.sort((a, b) => a[0].localeCompare(b[0]));
                renderUsers();
                checkChanges();
            });
            uncheckedContainer.appendChild(ol);
        });
    }

    if (searchInput.value) {
        searchInput.dispatchEvent(new Event("input"));
    }
}

async function getCheckedUsers() {
    try {
        const params = new URLSearchParams(window.location.search);

        const response = await axios.get(WEB_APP_URL, {
            params: {
                action: "getCheckedMembers",
                tokenId: localStorage.getItem("tokenId"),
                id: params.get("id")
            }
        });

        if (response.data.status === "success") {
            checkedUsers = allUsers.filter(user => {
                return response.data.members.some(att => att[1] === user[0]);
            });
            uncheckedUsers = allUsers.filter(user => {
                return !response.data.members.some(att => att[1] === user[0]);
            });

            initialCheckedUsers = JSON.parse(JSON.stringify(checkedUsers));
            initialUncheckedUsers = JSON.parse(JSON.stringify(uncheckedUsers));

            renderUsers();

        } else {
            loadingUser.textContent = "เกิดข้อผิดพลาดบางอย่าง " + response.data.message;
            if (response.data.logout) {
                localStorage.clear();
                window.location.reload();
            }
            return;
        }
    } catch (error) {
        console.error("Something went wrong!", error);
        loadingUser.textContent = "เกิดข้อผิดพลาดบางอย่าง" + error.toString();
        return;
    }

    searchInput.disabled = false;
    checked.style.display = "block";
    unchecked.style.display = "block";
    loadingUser.style.display = "none";
}

async function getUsers() {
    try {
        const response = await axios.get(WEB_APP_URL, {
            params: {
                action: "getAllMembers",
                tokenId: localStorage.getItem("tokenId")
            }
        });

        if (response.data.status === "success") {
            allUsers = response.data.members;
            getCheckedUsers();
        } else {
            loadingUser.textContent = "เกิดข้อผิดพลาดบางอย่าง " + response.data.message;
            if (response.data.logout) {
                localStorage.clear();
                window.location.reload();
            }
            return;
        }

    } catch (error) {
        console.error("Something went wrong!", error);
        loadingUser.textContent = "เกิดข้อผิดพลาดบางอย่าง" + error.toString();
        return;
    }
}

async function getMeeting() {
    try {
        const params = new URLSearchParams(window.location.search);

        const response = await axios.get(WEB_APP_URL, {
            params: {
                action: "getMeeting",
                id: params.get("id"),
                tokenId: localStorage.getItem("tokenId")
            }
        });

        if (response.data.status === "success") {
            const meeting = response.data.meeting;
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };

            meeting.StartTime = new Date(meeting.StartTime);
            meeting.EndTime = new Date(meeting.EndTime);
            const formatter = new Intl.DateTimeFormat('th-TH', options);
            const fullStartThaiDate = formatter.format(meeting.StartTime);
            const fullEndThaiDate = formatter.format(meeting.EndTime);

            eventStart.textContent = fullStartThaiDate;
            eventEnd.textContent = fullEndThaiDate;
            
            goToCalendar.href = meeting.CalendarUrl;
            goToSheet.href = response.data.sheetUrl;
            title.textContent = `แก้ไข "${meeting.Title}"`;

            mainTag.style.display = "block";
        } else {
            alert(response.data.message);
            if (response.data.logout) {
                localStorage.clear();
                window.location.reload();
            }
        }

    } catch (error) {
        console.error("Something went wrong!", error);
        title.textContent = "เกิดข้อผิดพลาดบางอย่าง" + error.toString();
    }
}

getMeeting();
getUsers();

searchInput.addEventListener("input", function () {
    const filter = searchInput.value.toLowerCase();
    const users = document.querySelectorAll(".user:not(.user-placeholder)");

    if (filter.length > 0) {
        clearSearch.style.display = "block";
    } else {
        clearSearch.style.display = "none";
    }

    users.forEach(user => {
        const name = user.querySelector(".left h3").textContent.toLowerCase();
        const email = user.querySelector(".left p").textContent.toLowerCase();

        if (name.includes(filter) || email.includes(filter)) {
            user.style.display = "flex";
        } else {
            user.style.display = "none";
        }
    });
});

clearSearch.addEventListener("click", function () {
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
    searchInput.focus();
});

discardBtn.addEventListener("click", () => {
    checkedUsers = JSON.parse(JSON.stringify(initialCheckedUsers));
    uncheckedUsers = JSON.parse(JSON.stringify(initialUncheckedUsers));
    renderUsers();
    checkChanges();
});

saveBtn.addEventListener("click", async () => {
    try {
        saving = true;
        saveBtn.disabled = true;
        discardBtn.disabled = true;
        saveBtn.textContent = "กำลังบันทึก...";
        
        const params = new URLSearchParams(window.location.search);

        const response = await axios.post(WEB_APP_URL, new URLSearchParams({
            action: "updateCheckedMembers",
            tokenId: localStorage.getItem("tokenId"),
            id: params.get("id"),
            members: JSON.stringify(checkedUsers),
            email: localStorage.getItem("loggedInAs")
        }));

        if (response.data.status === "success") {
            initialCheckedUsers = JSON.parse(JSON.stringify(checkedUsers));
            initialUncheckedUsers = JSON.parse(JSON.stringify(uncheckedUsers));
            checkChanges();
        } else {
            alert("เกิดข้อผิดพลาด: " + response.data.message);
            if (response.data.logout) {
                localStorage.clear();
                window.location.reload();
            }
        }
    } catch (error) {
        console.error("Save error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
        saveBtn.disabled = false;
        discardBtn.disabled = false;
        saveBtn.textContent = "บันทึกการเปลี่ยนแปลง";
        saving = false;
    }
});