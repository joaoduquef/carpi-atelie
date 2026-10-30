-- Novo preço dos abajures: R$ 349,00 (os modelos "em breve" continuam sem preço).
update public.modelos set preco_centavos = 34900 where preco_centavos is not null;
