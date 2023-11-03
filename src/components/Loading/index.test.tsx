import React from 'react';
import Loading from './index';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

const makeSut = () => {
  render(
      <Router>
        <Loading />
      </Router>,
  );
};

describe('Loading component', () => {
  it('should initially render the component the front text', () => {
    // arrange
    makeSut();

    // act
    const component = screen.getByTitle('loading-component');

    // assert
    expect(component).toBeDefined();
  });
});
