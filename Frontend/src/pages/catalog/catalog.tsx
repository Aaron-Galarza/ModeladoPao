import React from 'react';

const CatalogPage = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Nuestro Catálogo de Productos</h1>
      <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#555' }}>
        Aquí encontrarás todas nuestras creaciones.
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
        {/* Esto es solo un ejemplo de un "producto" */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', width: '250px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>Apliques de Flores</h3>
          <p style={{ margin: '0' }}>Ideal para decorar pasteles y cajas.</p>
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', width: '250px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>Souvenirs de Animales</h3>
          <p style={{ margin: '0' }}>Perfectos para fiestas infantiles.</p>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;