import { matchesCountry } from "../shared/country-search";

const search = document.querySelector<HTMLInputElement>("#countrySearch");
const empty = document.querySelector<HTMLElement>("#countryEmpty");
const countries = document.querySelectorAll<HTMLButtonElement>(".country-btn");

search?.addEventListener("input", () => {
  let visibleCount = 0;
  countries.forEach((button) => {
    const name = button.querySelector(".c-name")?.textContent ?? "";
    const visible = matchesCountry(name, search.value);
    button.hidden = !visible;
    if (visible) visibleCount++;
  });
  empty?.classList.toggle("hidden", visibleCount !== 0);
});
