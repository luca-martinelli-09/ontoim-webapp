import { fetchReports } from '$lib/utils'
import { json } from '@sveltejs/kit'

export const GET = async ({ url }) => {
  const query = url.searchParams.get("q");
  const keyword = url.searchParams.get("k");

  const allReports = await fetchReports();

  let finalReports = allReports.sort((a, b) => {
    return new Date(b.meta.date) - new Date(a.meta.date)
  })

  if (query) {
    finalReports = finalReports.filter((report) => {
      let searchInKeywords = false;

      for (let key of report.meta.keywords || []) {
        searchInKeywords = searchInKeywords || key.toLowerCase().includes(query.toLowerCase());
      }

      return report.meta.title?.toLowerCase().includes(query.toLowerCase()) || searchInKeywords;
    })
  }

  if (keyword) {
    finalReports = finalReports.filter((report) => {
      return report.meta.keywords?.includes(keyword.toLowerCase());
    })
  }

  return json(finalReports)
}