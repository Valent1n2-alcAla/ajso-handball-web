async function getEquipes() {
  const res = await fetch('http://localhost:8000/api/equipes', {
    headers: { Accept: 'application/ld+json' },
    cache: 'no-store',
  });
  return res.json();
}

export default async function EquipesPage() {
  const data = await getEquipes();

  return (
    <div>
      <h1>Équipes</h1>
      <ul>
        {(data['hydra:member'] ?? data['member'] ?? [])?.map((equipe: any) => (
          <li key={equipe.id}>{equipe.nom}</li>
        ))}
      </ul>
    </div>
  );
}