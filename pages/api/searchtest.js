import google from 'googlethis';

export default async function handler(req, res) {

  if (req.method !== 'GET')
    return res
      .status(405)
      .json({ status: 'failed', message: 'Metode tidak valid.' });

  if (!req.headers['x-csrf-token'] || req.headers['x-csrf-token'].length !== 32)
    return res
      .status(405)
      .json({ status: 'failed', message: 'Metode tidak valid bang.' });

  if (!req.query.q)
    return res
      .status(404)
      .json({ status: 'failed', message: 'Query tidak boleh kosong.' });

      
  const searchQuery = req.query.q;
  const page = req.query.page - 1 || 0;

  const options = {
    page: page,
    safe: false,
    parse_ads: false,
    additional_params: {
      hl: 'id',
    },
  };

  const response = await google.search(searchQuery, options);


  let knowledge_panel = response.knowledge_panel;

  if (
    response.knowledge_panel.title ||
    response.knowledge_panel.title !== 'N/A' ||
    !response.knowledge_panel.images
  ) {
    let dataImages = await google.image(searchQuery, { safe: false });
    let dummy = [];
    dataImages.slice(0, 8).map((a) => {
      dummy.push({ url: a.preview.url });
    });
    knowledge_panel.images = dummy;
  }

  return res.status(200).json({
    status: 'success',
    results: response.results,
    panel: knowledge_panel,
    people_also_search: response.people_also_search,
    related_search: response.people_also_ask,
    mungkin: response.did_you_mean,
  });
}
