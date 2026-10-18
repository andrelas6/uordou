import datetime, unittest
from build_words import merge_order, norm, played_days


class MergeOrderTest(unittest.TestCase):
    def test_first_run_uses_every_candidate(self):
        order = merge_order([], ['carro', 'mesa', 'livro'], frozen_days=0)
        self.assertEqual(sorted(order), ['carro', 'livro', 'mesa'])

    def test_same_input_keeps_same_order(self):
        existing = ['carro', 'mesa', 'livro', 'porta']
        self.assertEqual(merge_order(existing, set(existing), frozen_days=2), existing)

    def test_played_days_never_change_even_if_removed(self):
        existing = ['carro', 'mesa', 'livro', 'porta']
        order = merge_order(existing, {'livro', 'porta'}, frozen_days=2)
        self.assertEqual(order, ['carro', 'mesa', 'livro', 'porta'])

    def test_removed_future_word_shifts_only_later_days(self):
        existing = ['carro', 'mesa', 'livro', 'porta', 'gente']
        order = merge_order(existing, {'carro', 'mesa', 'porta', 'gente'}, frozen_days=2)
        self.assertEqual(order, ['carro', 'mesa', 'porta', 'gente'])

    def test_new_words_go_to_the_end(self):
        existing = ['carro', 'mesa']
        order = merge_order(existing, {'carro', 'mesa', 'livro', 'porta'}, frozen_days=1)
        self.assertEqual(order[:2], existing)
        self.assertEqual(sorted(order[2:]), ['livro', 'porta'])

    def test_accent_variant_is_not_added_twice(self):
        order = merge_order(['forca'], {'força'}, frozen_days=1)
        self.assertEqual(order, ['forca'])

    def test_future_word_takes_current_spelling(self):
        order = merge_order(['carro', 'forca'], {'carro', 'força'}, frozen_days=1)
        self.assertEqual(order, ['carro', 'força'])
        self.assertEqual([norm(w) for w in order], ['carro', 'forca'])


class PlayedDaysTest(unittest.TestCase):
    def test_counts_today(self):
        self.assertEqual(played_days(datetime.date(2026, 10, 17)), 0)
        self.assertEqual(played_days(datetime.date(2026, 10, 18)), 1)
        self.assertEqual(played_days(datetime.date(2026, 11, 1)), 15)


if __name__ == '__main__':
    unittest.main()
