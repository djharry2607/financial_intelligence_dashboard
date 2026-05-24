import Papa from "papaparse";

class MarketDataService {
  constructor() {
    this.marketUniverse = [];
  }

  async loadFromCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        download: false,
        skipEmptyLines: true,
        complete: (results) => {
          this.marketUniverse = results.data;
          resolve(results.data);
        },
        error: (err) => reject(err),
      });
    });
  }

  async loadFromJSON(data) {
    this.marketUniverse = data;
    return data;
  }

  getAllStocks() {
    return this.marketUniverse;
  }

  getBySector(sector) {
    return this.marketUniverse.filter(
      (stock) => stock.sector === sector
    );
  }

  getByMarketCap(cap) {
    return this.marketUniverse.filter(
      (stock) => stock.marketCapCategory === cap
    );
  }

  search(query) {
    return this.marketUniverse.filter((stock) =>
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export default new MarketDataService();
