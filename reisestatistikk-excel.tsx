import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ReisestatistikkAnalysis = () => {
  const [activeTab, setActiveTab] = useState('bus');
  
  // Bus data
  const busData = [
    { month: "Januar", "2018": 2877886, "2019": 3007158, "2020": 3187389, "2021": 1645617, "2022": 2250025, "2023": 3510646 },
    { month: "Februar", "2018": 2709337, "2019": 2816059, "2020": 3086781, "2021": 2023385, "2022": 2656287, "2023": 3445100 },
    { month: "Mars", "2018": 2760263, "2019": 3146587, "2020": 1435546, "2021": 2392944, "2022": 3532073, "2023": 4001634 },
    { month: "April", "2018": 2715844, "2019": 2378577, "2020": 951217, "2021": 1916675, "2022": 2636552, "2023": 2893234 },
    { month: "Mai", "2018": 2491899, "2019": 2614642, "2020": 1398484, "2021": 2018393, "2022": 3007107, "2023": 3292729 },
    { month: "Juni", "2018": 2176578, "2019": 2082213, "2020": 1521437, "2021": 1634851, "2022": 2548071, "2023": 3005325 },
    { month: "Juli", "2018": 1285263, "2019": 1390313, "2020": 1132606, "2021": 1162871, "2022": 1563256, "2023": 1747403 },
    { month: "August", "2018": 2379872, "2019": 2633256, "2020": 1861621, "2021": 2291975, "2022": 2848227, "2023": 3301338 },
    { month: "September", "2018": 2771714, "2019": 2828550, "2020": 2086103, "2021": 2811992, "2022": 3484796, "2023": 3862007 },
    { month: "Oktober", "2018": 3055992, "2019": 3131135, "2020": 2198807, "2021": 3109400, "2022": 3403839, "2023": 3852100 },
    { month: "November", "2018": 3147348, "2019": 3268081, "2020": 2068098, "2021": 3259738, "2022": 3531840, "2023": 4020456 },
    { month: "Desember", "2018": 2460042, "2019": 2540171, "2020": 1562751, "2021": 2249386, "2022": 2921141, "2023": null }
  ];
  
  // Tram data
  const tramData = [
    { month: "Januar", "2018": 90823, "2019": 94278, "2020": 102752, "2021": 55565, "2022": 72090, "2023": 106010 },
    { month: "Februar", "2018": 86089, "2019": 87567, "2020": 107255, "2021": 61243, "2022": 80870, "2023": 103264 },
    { month: "Mars", "2018": 86413, "2019": 104343, "2020": 59713, "2021": 69154, "2022": 107770, "2023": 127216 },
    { month: "April", "2018": 86339, "2019": 80958, "2020": 26736, "2021": 60689, "2022": 80056, "2023": 95104 },
    { month: "Mai", "2018": 89003, "2019": 97058, "2020": 47351, "2021": 60368, "2022": 101523, "2023": 110280 },
    { month: "Juni", "2018": 82288, "2019": 84564, "2020": 66144, "2021": 57677, "2022": 92021, "2023": 110478 },
    { month: "Juli", "2018": 53108, "2019": 59389, "2020": 50950, "2021": 48520, "2022": 61928, "2023": 65577 },
    { month: "August", "2018": 76740, "2019": 93397, "2020": 66560, "2021": 67674, "2022": 95935, "2023": 104433 },
    { month: "September", "2018": 82593, "2019": 96503, "2020": 76053, "2021": 75565, "2022": 104804, "2023": 110978 },
    { month: "Oktober", "2018": 92076, "2019": 104702, "2020": 75012, "2021": 84063, "2022": 110244, "2023": 110250 },
    { month: "November", "2018": 98218, "2019": 104995, "2020": 63535, "2021": 83978, "2022": 107974, "2023": 118236 },
    { month: "Desember", "2018": 81408, "2019": 92698, "2020": 53738, "2021": 67289, "2022": 92698, "2023": null }
  ];

  // Calculate totals for bus and tram
  const busTotals = {};
  const tramTotals = {};
  const years = ["2018", "2019", "2020", "2021", "2022", "2023"];
  
  years.forEach(year => {
    busTotals[year] = busData.reduce((sum, row) => sum + (row[year] || 0), 0);
    tramTotals[year] = tramData.reduce((sum, row) => sum + (row[year] || 0), 0);
  });
  
  // Calculate combined totals (bus + tram)
  const combinedTotals = years.map(year => ({
    year,
    bus: busTotals[year],
    tram: tramTotals[year],
    total: busTotals[year] + tramTotals[year]
  }));
  
  // Year-over-year changes for bus (percentage)
  const busYoYChanges = busData.map(row => {
    const changes = { month: row.month };
    years.slice(1).forEach((year, index) => {
      const prevYear = years[index];
      if (row[year] && row[prevYear]) {
        changes[`${year} vs ${prevYear}`] = ((row[year] / row[prevYear]) - 1) * 100;
      } else {
        changes[`${year} vs ${prevYear}`] = null;
      }
    });
    return changes;
  });
  
  // Year-over-year changes for tram (percentage)
  const tramYoYChanges = tramData.map(row => {
    const changes = { month: row.month };
    years.slice(1).forEach((year, index) => {
      const prevYear = years[index];
      if (row[year] && row[prevYear]) {
        changes[`${year} vs ${prevYear}`] = ((row[year] / row[prevYear]) - 1) * 100;
      } else {
        changes[`${year} vs ${prevYear}`] = null;
      }
    });
    return changes;
  });

  // Key information from page 2
  const keyInfo = [
    {
      category: "Billettsystem og datafangst",
      periods: [
        {
          period: "Until 2019/08",
          description: "EBIT – validering av t-kort og mobilletter"
        },
        {
          period: "2019/08 - 2020/09",
          description: "-"
        },
        {
          period: "From 2020/09",
          description: "Fara/Entur – åpen billettering, APC"
        }
      ]
    },
    {
      category: "Tilgang på detaljert reisestatistikk",
      periods: [
        {
          period: "Until 2019/08",
          description: "Ja"
        },
        {
          period: "2019/08 - 2020/09",
          description: "Nei – kalibrering av APC"
        },
        {
          period: "From 2021/01",
          description: "Ja"
        }
      ]
    },
    {
      category: "Rapporteringsmetode",
      periods: [
        {
          period: "Until 2019/08",
          description: "Påstigninger fra EBIT"
        },
        {
          period: "2019/08 - 2020/09",
          description: "Beregning basert på salg"
        },
        {
          period: "From 2021/01",
          description: "Påstigninger fra APC"
        }
      ]
    },
    {
      category: "Rutestruktur i rapportering",
      periods: [
        {
          period: "Until 2020/09",
          description: "Gammel struktur – færre påstigninger pr reise"
        },
        {
          period: "From 2021/01",
          description: "Ny struktur – flere påstigninger pr reise"
        }
      ]
    }
  ];
  
  // Format large numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "-";
    return num.toLocaleString();
  };
  
  // Format percentages
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return "-";
    return value.toFixed(2) + "%";
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reisestatistikk Analyse (2018-2023)</h1>
      
      <div className="mb-6">
        <div className="flex mb-4">
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'bus' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('bus')}
          >
            Buss Data
          </button>
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'tram' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('tram')}
          >
            Trikk Data
          </button>
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'combined' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('combined')}
          >
            Kombinert Analyse
          </button>
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'yoy' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('yoy')}
          >
            Årlig Endring
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('info')}
          >
            Nøkkelinformasjon
          </button>
        </div>
        
        {activeTab === 'bus' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Antall påstigninger buss (2018-2023)</h2>
            
            <div className="mb-8 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Måned</th>
                    {years.map(year => (
                      <th key={year} className="border border-gray-300 p-2">{year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {busData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 p-2 font-medium">{row.month}</td>
                      {years.map(year => (
                        <td key={year} className="border border-gray-300 p-2 text-right">
                          {formatNumber(row[year])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 p-2">Totalsum</td>
                    {years.map(year => (
                      <td key={year} className="border border-gray-300 p-2 text-right">
                        {formatNumber(busTotals[year])}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="h-96 mb-8">
              <h3 className="text-lg font-medium mb-2">Månedlig trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={busData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="2018" stroke="#8884d8" />
                  <Line type="monotone" dataKey="2019" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="2020" stroke="#ff7300" />
                  <Line type="monotone" dataKey="2021" stroke="#0088FE" />
                  <Line type="monotone" dataKey="2022" stroke="#00C49F" />
                  <Line type="monotone" dataKey="2023" stroke="#FFBB28" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {activeTab === 'tram' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Antall påstigninger trikk (2018-2023)</h2>
            
            <div className="mb-8 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Måned</th>
                    {years.map(year => (
                      <th key={year} className="border border-gray-300 p-2">{year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tramData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 p-2 font-medium">{row.month}</td>
                      {years.map(year => (
                        <td key={year} className="border border-gray-300 p-2 text-right">
                          {formatNumber(row[year])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 p-2">Totalsum</td>
                    {years.map(year => (
                      <td key={year} className="border border-gray-300 p-2 text-right">
                        {formatNumber(tramTotals[year])}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="h-96 mb-8">
              <h3 className="text-lg font-medium mb-2">Månedlig trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={tramData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="2018" stroke="#8884d8" />
                  <Line type="monotone" dataKey="2019" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="2020" stroke="#ff7300" />
                  <Line type="monotone" dataKey="2021" stroke="#0088FE" />
                  <Line type="monotone" dataKey="2022" stroke="#00C49F" />
                  <Line type="monotone" dataKey="2023" stroke="#FFBB28" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {activeTab === 'combined' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Kombinert Analyse (Buss + Trikk)</h2>
            
            <div className="mb-8 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">År</th>
                    <th className="border border-gray-300 p-2">Buss</th>
                    <th className="border border-gray-300 p-2">Trikk</th>
                    <th className="border border-gray-300 p-2">Total</th>
                    <th className="border border-gray-300 p-2">Trikk %</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedTotals.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 p-2 font-medium">{row.year}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatNumber(row.bus)}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatNumber(row.tram)}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatNumber(row.total)}</td>
                      <td className="border border-gray-300 p-2 text-right">
                        {formatPercentage((row.tram / row.total) * 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="h-96 mb-8">
              <h3 className="text-lg font-medium mb-2">Årlige totaler</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={combinedTotals}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="bus" name="Buss" fill="#82ca9d" />
                  <Bar dataKey="tram" name="Trikk" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {activeTab === 'yoy' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Årlig Endring (%)</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Buss - Årlig endring (%)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Måned</th>
                      {years.slice(1).map((year, index) => (
                        <th key={year} className="border border-gray-300 p-2">{`${year} vs ${years[index]}`}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {busYoYChanges.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 p-2 font-medium">{row.month}</td>
                        {years.slice(1).map((year, i) => (
                          <td key={i} className="border border-gray-300 p-2 text-right">
                            {formatPercentage(row[`${year} vs ${years[i]}`])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Trikk - Årlig endring (%)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Måned</th>
                      {years.slice(1).map((year, index) => (
                        <th key={year} className="border border-gray-300 p-2">{`${year} vs ${years[index]}`}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tramYoYChanges.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 p-2 font-medium">{row.month}</td>
                        {years.slice(1).map((year, i) => (
                          <td key={i} className="border border-gray-300 p-2 text-right">
                            {formatPercentage(row[`${year} vs ${years[i]}`])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'info' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Viktige avklaringer</h2>
            
            <div className="space-y-6">
              {keyInfo.map((item, index) => (
                <div key={index}>
                  <h3 className="text-lg font-medium mb-2">{item.category}</h3>
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">Periode</th>
                        <th className="border border-gray-300 p-2">Beskrivelse</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.periods.map((period, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="border border-gray-300 p-2 font-medium">{period.period}</td>
                          <td className="border border-gray-300 p-2">{period.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-gray-100 rounded">
                <h3 className="text-lg font-medium mb-2">Viktig Kontekst</h3>
                <p className="mb-2">
                  Fra august 2019 til september 2020 hadde vi ikke tilgang på reisestatistikk fra APC-systemet. Vi hadde derfor ikke statistikk på linje-, tur eller 
                  holdeplassnivå for buss. I offentlig rapportering akkumulert på måneds- og årsnivå estimerte vi antall reiser basert på solgte billetter, og rapporterte 
                  antall reiser basert på beregninger frem til 2021.
                </p>
                <p className="mb-2">
                  Vi antar et 1:1-forhold mellom solgte enkeltbilletter og antall påstigninger fra enkeltbillett. Beregning av antall påstigninger med periode ble gjort ut fra
                  antakelser av antall reiser pr solgte/gyldige periode. Antall påstigninger pr reise er høyere etter ruteomleggingen fordi flere som tidligere hadde
                  direktebuss, nå har overgang. Siden vi rapporterer antall påstigninger (ikke antall reiser), er det vanskelig å sammenligne reisestatistikk før og etter
                  ruteomleggingen.
                </p>
                <p>
                  Før rapportering av Kostra for 2020 ble det bestemt at 2020-statistikken (som ble gjort ved beregning av salgstall) skulle gjøres med den gamle
                  rutestrukturen som utgangspunkt. År 2021, da vi begynte med rapportering av tall fra APC-systemet, er dermed første år med reisestatistikk basert på
                  dagens rutestruktur. 2021 ble et dårlig år for reisestatistikken med effekter av korona. Samtidig var det gunstig for oss å gjøre denne metodeendringen
                  fra gammel til ny rutestruktur under pandemien.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReisestatistikkAnalysis;
