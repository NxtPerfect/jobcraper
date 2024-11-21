import { useEffect, useState } from "react";
import JobOffers from "./components/JobOffers"
import Filters from "./components/Filters";
import Pagination from "./components/Pagination";

type OfferType = {
  title: string,
  by_company: string,
  city: string,
  technologies: string,
  link: string
};

export type ActiveFilter = {
  title: string,
  companiesToInclude: Array<string>,
  citiesToInclude: Array<string>,
  technologiesToInclude: Array<string>,
};


function App() {
  const [offers, setOffers] = useState<Array<OfferType>>([]);
  const [filteredOffers, setFilteredOffers] = useState<Array<OfferType>>([]);
  const [cities, setCities] = useState<Array<string>>();
  const [companies, setCompanies] = useState<Array<string>>();
  const [technologies, setTechnologies] = useState<Array<string>>();
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [offersPerPage, setOffersPerPage] = useState<number>(12);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter>({ title: "", companiesToInclude: [], citiesToInclude: [], technologiesToInclude: [] });

  useEffect(() => {
    fetch("http://localhost:8000/offers")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setOffers(data);
        setFilteredOffers(data);
      })
  }, []);

  useEffect(() => {
    setCities(() => Array.from(new Set(offers.map((offer) => offer.city))).sort());
    setCompanies(() => Array.from(new Set(offers.map((offer) => offer.by_company))).sort());
    setTechnologies(() => Array.from(new Set(offers.map((offer) => offer.technologies.split(",")).flat())).sort());
  }, [offers])

  function handleUpdatingFilters(searchTitle: string, includedCities: Array<string>, includedCompanies: Array<string>, includedTechnologies: Array<string>) {
    console.log("Handling filters...", activeFilters)
    setActiveFilters((activeFilters: ActiveFilter) => {
      if (!activeFilters) {
        return {
          title: searchTitle,
          citiesToInclude: includedCities,
          companiesToInclude: includedCompanies,
          technologiesToInclude: includedTechnologies,
        };
      }
      activeFilters.title = searchTitle;
      activeFilters.citiesToInclude = includedCities;
      activeFilters.companiesToInclude = includedCompanies;
      activeFilters.technologiesToInclude = includedTechnologies;
      return activeFilters;
    }
    )
    console.log("Updating filters...", activeFilters)
    setFilteredOffers(() => offers.filter((offer) => offer.title === activeFilters?.title && activeFilters?.companiesToInclude.includes(offer.by_company) && activeFilters?.citiesToInclude.includes(offer.city) && activeFilters?.technologiesToInclude.includes(offer.technologies)))
  }


  return (
    <main className="bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      {process.env.REACT_APP_FEATURE_FLAG_FILTERS === "true" ? <Filters cities={cities} companies={companies} technologies={technologies} handleUpdatingFilters={handleUpdatingFilters} /> : null}
      <Pagination maxPages={Math.floor(filteredOffers.length / offersPerPage)} pageIndex={pageIndex} setPageIndex={setPageIndex} offersPerPage={offersPerPage} setOffersPerPage={setOffersPerPage} />
      <JobOffers offers={filteredOffers.slice((pageIndex - 1) * offersPerPage, (pageIndex) * offersPerPage)} />
      <Pagination maxPages={Math.floor(filteredOffers.length / offersPerPage)} pageIndex={pageIndex} setPageIndex={setPageIndex} offersPerPage={offersPerPage} setOffersPerPage={setOffersPerPage} />
    </main>
  )
}

export default App
