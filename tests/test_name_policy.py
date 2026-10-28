import unittest
import test_style_order_manager as fixtures

class NamePolicyTests(unittest.TestCase):
    setUp = fixtures.StyleTests.setUp
    post = fixtures.StyleTests.post

    def test_whitespace_names_roundtrip_without_renaming(self):
        styles = [{'name': n, 'prompt':'', 'negative_prompt':''} for n in ('Alpha', ' Alpha ')]
        result = self.post('save', styles=styles, backup_enabled=False)
        self.assertEqual(result.status_code, 200, result.text)
        self.assertEqual([x['name'] for x in result.json()['styles']], ['Alpha',' Alpha '])

    def test_unicode_duplicate_rejection_preserves_csv(self):
        original = self.path.read_bytes()
        result = self.post('save', styles=[{'name': n} for n in ('Straße','STRASSE')])
        self.assertEqual(result.status_code,400)
        self.assertEqual(self.path.read_bytes(), original)

    def test_next_name_uses_server_identity_without_writing(self):
        original = self.path.read_bytes()
        for base,names,expected in [
            ('New Style',['new style'],'New Style 2'),
            ('New Style',['New ſtyle','NEW STYLE 2'],'New Style 3'),
            ('STRASSE',['Straße'],'STRASSE 2'),
            ('New Style',[' New Style '],'New Style'),
            ('新しいスタイル',['新しいスタイル','新しいスタイル 2'],'新しいスタイル 3')]:
            with self.subTest(names=names):
                response=self.post('next-name',base=base,names=names)
                self.assertEqual(response.status_code,200,response.text)
                self.assertEqual(response.json()['name'],expected)
        self.assertEqual(self.path.read_bytes(), original)
        self.assertFalse(list(self.backups.iterdir()))

    def test_next_name_invalid_request_is_read_only(self):
        original=self.path.read_bytes()
        for body in ({'base':' ', 'names':[]},{'base':'New Style','names':[None]}, {'base':'A','names':'A'}):
            self.assertEqual(self.post('next-name',**body).status_code,400)
        self.assertEqual(self.path.read_bytes(),original)
