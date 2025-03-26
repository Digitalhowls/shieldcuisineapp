import React from 'react';
import { Layout } from '@/components/cms/layout';
import AnimationDemo from '@/components/cms/animations/animation-demo';

/**
 * Página de juego de animaciones para el CMS
 * 
 * Esta página proporciona un entorno para probar las diferentes
 * animaciones disponibles en el sistema.
 */
const AnimationPlayground: React.FC = () => {
  return (
    <Layout>
      <AnimationDemo />
    </Layout>
  );
};

export default AnimationPlayground;