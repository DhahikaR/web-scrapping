import * as cheerio from "cheerio";
import axios from "axios";
import j2cp from "@json2csv/plainjs";
import fs from "fs";

const booksUrl =
  "https://books.toscrape.com/catalogue/category/books/fiction_10/index.html";
const baseUrl =
  "https://books.toscrape.com/catalogue/category/books/fiction_10/";
const book_data = [];

async function getBooks(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const book = $("article");
    book.each(function () {
      const title = $(this).find("h3 a").text();
      const price = $(this).find(".price_color").text();
      const stock = $(this).find(".availability").text().trim();

      book_data.push({ title, price, stock });
    });

    if ($(".next a").length > 0) {
      const next_page = baseUrl + $(".next a").attr("href");
      getBooks(next_page);
    } else {
      const parser = new j2cp();
      const csv = parser.parse(book_data);
      fs.writeFileSync("./books.csv", csv);
    }
    console.log(book_data);
  } catch (error) {
    console.error(error);
  }
}

getBooks(booksUrl);
