/* SAMPLE DATA. Replace with the school's real records. */
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const TEACHERS = [
  { id: "T001", name: "Grace Namutebi", subject: "Mathematics", dept: "Sciences", qual: "B.Sc. Ed.", joined: 2012, classes: "S3, S4, S6" },
  { id: "T002", name: "Samuel Okello", subject: "Physics", dept: "Sciences", qual: "B.Sc. Ed.", joined: 2014, classes: "S2, S4, S5" },
  { id: "T003", name: "Ruth Achieng", subject: "Chemistry", dept: "Sciences", qual: "M.Sc.", joined: 2010, classes: "S3, S5, S6" },
  { id: "T004", name: "Daniel Mugisha", subject: "Biology", dept: "Sciences", qual: "B.Sc. Ed.", joined: 2016, classes: "S1, S2, S4" },
  { id: "T005", name: "Esther Nakato", subject: "English", dept: "Languages", qual: "B.A. Ed.", joined: 2011, classes: "S1, S2, S3" },
  { id: "T006", name: "Peter Ssemwogerere", subject: "Literature", dept: "Languages", qual: "M.A.", joined: 2013, classes: "S4, S5, S6" },
  { id: "T007", name: "Mary Atim", subject: "Geography", dept: "Humanities", qual: "B.A. Ed.", joined: 2017, classes: "S1, S3, S5" },
  { id: "T008", name: "John Byaruhanga", subject: "History", dept: "Humanities", qual: "B.A. Ed.", joined: 2009, classes: "S2, S4, S6" },
  { id: "T009", name: "Sarah Nabirye", subject: "Computer Studies", dept: "Technology", qual: "B.Sc. IT", joined: 2019, classes: "S1 to S4" },
  { id: "T010", name: "Isaac Opio", subject: "Economics", dept: "Humanities", qual: "B.A. Econ.", joined: 2018, classes: "S5, S6" },
  { id: "T011", name: "Hellen Kyomuhendo", subject: "Agriculture", dept: "Technology", qual: "B.Sc. Agric.", joined: 2015, classes: "S1, S2, S3" },
  { id: "T012", name: "Joseph Lutaaya", subject: "Physical Education", dept: "Arts & Sports", qual: "Dip. Ed.", joined: 2020, classes: "S1 to S6" }
];

const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "Computer Studies"];

/* Whole-school results per year */
const PERFORMANCE = {
  2020: { candidates: 412, avg: 58.2, pass: 71.4, dist: 38, subj: [54, 61, 52, 55, 60, 63, 62, 57] },
  2021: { candidates: 436, avg: 60.1, pass: 73.9, dist: 44, subj: [56, 63, 54, 58, 62, 64, 63, 60] },
  2022: { candidates: 451, avg: 62.7, pass: 77.2, dist: 53, subj: [60, 65, 58, 60, 64, 66, 65, 63] },
  2023: { candidates: 468, avg: 64.5, pass: 79.8, dist: 61, subj: [62, 66, 60, 63, 66, 67, 66, 66] },
  2024: { candidates: 489, avg: 66.3, pass: 82.1, dist: 72, subj: [64, 68, 63, 65, 68, 68, 67, 69] },
  2025: { candidates: 503, avg: 68.0, pass: 84.6, dist: 81, subj: [66, 70, 65, 67, 69, 70, 69, 71] },
  2026: { candidates: 521, avg: 69.4, pass: 86.3, dist: 90, subj: [68, 71, 67, 69, 71, 71, 70, 73] }
};

/* Students: deterministic sample records with yearly history */
const STUDENTS = (function () {
  const first = ["Amina","Brian","Clara","David","Edith","Felix","Gloria","Hassan","Irene","Jacob","Kevin","Lydia","Moses","Naomi","Oscar","Patience","Quincy","Rebecca","Simon","Tabitha","Umar","Vivian","Wilson","Yvonne"];
  const last = ["Nansubuga","Mukasa","Atuhaire","Ouma","Kisakye","Wasswa","Akello","Namukasa","Tumusiime","Kato","Nambi","Odongo","Birungi","Ssebuliba","Auma","Kiiza","Namara","Lubega","Apio","Mwesigwe","Nalubega","Okurut","Baguma","Nakitende"];
  const houses = ["Blue", "Gold", "Green", "Red"];
  const out = [];
  for (let i = 0; i < 24; i++) {
    const lvl = (i % 6) + 1;                 // S1..S6 in 2026
    const stream = i % 12 < 6 ? "A" : "B";
    const start = 2026 - (lvl - 1);          // year of S1 entry
    const ability = 52 + ((i * 37) % 30);    // base ability 52..81
    const hist = {};
    for (let y = Math.max(start, 2020); y <= 2026; y++) {
      const wobble = ((i * 7 + y) % 9) - 4;
      hist[y] = Math.min(98, Math.max(35, Math.round(ability + (y - start) * 1.2 + wobble)));
    }
    const avg = hist[2026];
    out.push({
      id: "A" + (2026 - lvl + 1 - 2000) + String(100 + i * 3),
      name: first[i] + " " + last[i],
      cls: "S" + lvl + stream,
      gender: i % 2 ? "M" : "F",
      house: houses[i % 4],
      avg, hist,
      grade: avg >= 80 ? "A" : avg >= 70 ? "B" : avg >= 60 ? "C" : avg >= 50 ? "D" : "E"
    });
  }
  return out;
})();
