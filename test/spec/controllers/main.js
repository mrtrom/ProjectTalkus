'use strict';

describe('filter', function () {

  // load the controller's module
  beforeEach(module('talkusApp.filters'));

  describe('convertAtoE', function(){

    it('should convert first letter a to e',
      inject(function(convertAtoEFilter){
        expect(convertAtoEFilter('a')).toBe('e');
      }));

  });
});