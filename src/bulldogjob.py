from src.db import Database, Offer
from src.scrape_agent import fetchWebsite, getRandomProxy, getRandomUserAgent, returnBeautifulSoupedHTML, setHeaders, setProxies, setSession
from os import environ
from threading import Thread

OFFER_CLASS = "JobListItem_item__fYh8y" # ae
TITLE_CLASS = "JobListItem_item__title__278xz" # h3v
ADDITIONAL_INFORMATION_CLASS = " JobListItem_item__details__sg4tk" # div
TECHNOLOGIES_LIST_CLASS = "JobListItem_item__tags__POZkk" # div

class NoFluffJobsOffer(Offer):
    def __init__(self, offer):
        super().__init__(offer)
        try:
            self.date_added = "01-01-1990"
            additional_info = offer.select(f'div[class={TITLE_CLASS}]')[0]
            self.title = additional_info.find_next('h3').get_text().strip()
            self.by_company = additional_info.find('div').find('div').get_text().strip()
            details = offer.select(f'div[class={ADDITIONAL_INFORMATION_CLASS}]')[0]
            self.city = details.find_next('div').find_next('span').get_text().strip()
            self.additional_info = details.find_next('div').find_next('div').find_next('div').get_text().strip()
            self.technologies = [x.find_next('div').find_next('span').get_text().strip() for x in offer.select(f'div[class="{TECHNOLOGIES_LIST_CLASS}"]')]
            self.link = offer['href'].strip()
            self.calculateAndAssignHash()
        except Exception as e:
            print(f"Failed to add new offer {e}")
    def print(self):
        print(self.title, self.by_company, self.city, self.date_added, self.additional_info, self.technologies)

def runBulldogJob():
    db = Database()
    userAgent = getRandomUserAgent()
    proxies = setProxies(getRandomProxy())
    headers = setHeaders(userAgent)
    session = setSession(headers, proxies)

    url = str(environ.get("BULLDOGJOB_URL"))
    response = fetchWebsite(session, url)
    parsedResponse = returnBeautifulSoupedHTML(response.content)
    containerDivs = parsedResponse.select(f'div[class^="bg-gray-bg"]')
    offers = containerDivs[0].select('div[class="container"]')[0].find_all('a')

    for offer in offers:
        Thread(target=insertNewOfferFromList,args=(offer, db,)).start()
    # db.selectAllOffers()

def insertNewOfferFromList(offer, db):
    newOffer = NoFluffJobsOffer(offer)
    lastRow = db.insertNewOffer(newOffer)
    # print("New offer:", newOffer.print())
    print("Last inserted row:", lastRow)

if __name__ == "__main__":
    runBulldogJob()
