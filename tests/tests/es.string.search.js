import { GLOBAL, STRICT } from '../helpers/constants';
import { patchRegExp$exec } from '../helpers/helpers';

const Symbol = GLOBAL.Symbol || {};

const run = assert => {
  assert.isFunction(''.search);
  assert.arity(''.search, 1);
  assert.name(''.search, 'search');
  assert.looksNative(''.search);
  assert.nonEnumerable(String.prototype, 'search');
  let instance = Object(true);
  instance.search = String.prototype.search;
  assert.strictEqual(instance.search(true), 0, 'S15.5.4.12_A1_T1');
  instance = Object(false);
  instance.search = String.prototype.search;
  assert.strictEqual(instance.search(false), 0, 'S15.5.4.12_A1_T2');
  assert.strictEqual(''.search(), 0, 'S15.5.4.12_A1_T4 #1');
  assert.strictEqual('--undefined--'.search(), 0, 'S15.5.4.12_A1_T4 #2');
  assert.strictEqual('gnulluna'.search(null), 1, 'S15.5.4.12_A1_T5');
  assert.strictEqual(Object('undefined').search(undefined), 0, 'S15.5.4.12_A1_T6');
  assert.strictEqual('undefined'.search(undefined), 0, 'S15.5.4.12_A1_T7');
  assert.strictEqual(String({
    toString() { /* empty */ },
  }).search(undefined), 0, 'S15.5.4.12_A1_T8');
  assert.strictEqual('ssABB\u0041BABAB'.search({
    toString() {
      return '\u0041B';
    },
  }), 2, 'S15.5.4.12_A1_T10');
  try {
    'ABB\u0041BABAB'.search({
      toString() {
        throw new Error('intostr');
      },
    });
    assert.ok(false, 'S15.5.4.12_A1_T11 #1 lead to throwing exception');
  } catch (error) {
    assert.strictEqual(error.message, 'intostr', 'S15.5.4.12_A1_T11 #2');
  }
  try {
    Object('ABB\u0041BABAB').search({
      toString() {
        return {};
      },
      valueOf() {
        throw new Error('intostr');
      },
    });
    assert.ok(false, 'S15.5.4.12_A1_T12 #1 lead to throwing exception');
  } catch (error) {
    assert.strictEqual(error.message, 'intostr', 'S15.5.4.12_A1_T12 #2');
  }
  assert.strictEqual('ABB\u0041B\u0031ABAB\u0031BBAA'.search({
    toString() {
      return {};
    },
    valueOf() {
      return 1;
    },
  }), 5, 'S15.5.4.12_A1_T13');
  assert.strictEqual('ABB\u0041BABAB\u0037\u0037BBAA'.search(RegExp('77')), 9, 'S15.5.4.12_A1_T14');
  assert.strictEqual(Object('test string').search('string'), 5, 'S15.5.4.12_A2_T1');
  assert.strictEqual(Object('test string').search('String'), -1, 'S15.5.4.12_A2_T2');
  assert.strictEqual(Object('test string').search(/String/i), 5, 'S15.5.4.12_A2_T3');
  assert.strictEqual(Object('test string').search(/Four/), -1, 'S15.5.4.12_A2_T4');
  assert.strictEqual(Object('one two three four five').search(/four/), 14, 'S15.5.4.12_A2_T5');
  assert.strictEqual(Object('test string').search('notexist'), -1, 'S15.5.4.12_A2_T6');
  assert.strictEqual(Object('test string probe').search('string pro'), 5, 'S15.5.4.12_A2_T7');
  let string = Object('power of the power of the power of the power of the power of the power of the great sword');
  assert.strictEqual(string.search(/the/), string.search(/the/g), 'S15.5.4.12_A3_T1');
  string = Object('power \u006F\u0066 the power of the power \u006F\u0066 the power of the power \u006F\u0066 the power of the great sword');
  assert.strictEqual(string.search(/of/), string.search(/of/g), 'S15.5.4.12_A3_T2');
};

QUnit.test('String#search regression', run);

QUnit.test('RegExp#@@search appearance', assert => {
  const search = /./[Symbol.search];
  assert.isFunction(search);
  // assert.name(search, '[Symbol.search]');
  assert.arity(search, 1);
  assert.looksNative(search);
  assert.nonEnumerable(RegExp.prototype, Symbol.search);
});

QUnit.test('RegExp#@@search basic behavior', assert => {
  assert.strictEqual(/four/[Symbol.search]('one two three four five'), 14);
  assert.strictEqual(/Four/[Symbol.search]('one two three four five'), -1);
});

QUnit.test('String#search delegates to @@search', assert => {
  const string = STRICT ? 'string' : Object('string');
  const number = STRICT ? 42 : Object(42);
  const object = {};
  object[Symbol.search] = function (it) {
    return { value: it };
  };
  assert.strictEqual(string.search(object).value, string);
  assert.strictEqual(''.search.call(number, object).value, number);
  const regexp = /./;
  regexp[Symbol.search] = function (it) {
    return { value: it };
  };
  assert.strictEqual(string.search(regexp).value, string);
  assert.strictEqual(''.search.call(number, regexp).value, number);
});

QUnit.test('RegExp#@@search delegates to exec', assert => {
  let execCalled = false;
  let re = /b/;
  re.lastIndex = 7;
  re.exec = function () {
    execCalled = true;
    return /./.exec.apply(this, arguments);
  };
  assert.deepEqual(re[Symbol.search]('abc'), 1);
  assert.ok(execCalled);
  assert.strictEqual(re.lastIndex, 7);

  re = /b/;
  // Not a function, should be ignored
  re.exec = 3;
  assert.deepEqual(re[Symbol.search]('abc'), 1);

  re = /b/;
  // Does not return an object, should throw
  re.exec = () => 3;
  assert.throws(() => re[Symbol.search]('abc'));
});

QUnit.test('RegExp#@@search implementation', patchRegExp$exec(run));
