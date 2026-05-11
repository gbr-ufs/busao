// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { i18n } from "../shared/types";

export const ptBR: i18n = {
	admin: {
		button: "Enviar",
		cancel: "Cancelar viagem",
		clear: "Cancelar viagens",
		confirm: "Você tem certeza?",
		password: "Senha",
		seatCount: "Quantidade de assentos",
	},
	cancel: {
		alreadyCancelled: "Viagem já cancelada.",
		question:
			"Tem certeza de que quer cancelar sua viagem? Essa ação não pode ser desfeita.",
		success: "Viagem cancelada com sucesso.",
	},
	configuration: {
		orientation: "left-to-right",
	},
	error: "Falha na operação. Tente novamente mais tarde.",
	errors: {
		formEntryLong:
			"Dado do formulário excede o limite de caracteres. Por favor, preencha uma entrada menor.",
		invalidPassword: "Senha inválida. Tente novamente.",
		tripTokenNotFound: "Token não encontrado.",
		undefinedFormData:
			"Dados do formulário faltando. Por favor, preencha o formulário corretamente",
	},
	form: {
		button: "Agendar Viagem",
		incomplete: "Formulário incompleto",
		nameTooLong: "Nome muito grande (acima de 64 carácteres)",
		personalInformation: "Informações Pessoais",

		trip: {
			legend: "Tipo de Viagem",
		},
	},
	lang: "pt-BR",
	meta: {
		description: "Sistema de Gerenciamento de Vagas de Ônibus",
		keywords: [
			"Banco de Dados",
			"Design Orientado ao Domínio",
			"Injeção de Dependências",
			"Educação",
			"Transporte",
			"Transporte Público",
			"Vanilla Web",
		],
	},
	name: "Nome",
	nav: {
		admin: "Admin",
		waitlist: "Lista de Espera",
	},
	no: "Não",
	notFound: {
		h2: "Página não encontrada",
		p: "Perdão, mas a página solicitada não pode ser encontrada",
	},
	skipToContent: "Ir para o conteúdo principal",
	success: {
		cancelled: "Viagem cancelada com sucesso!",
		confirmed: "Viagem agendada com sucesso!",
		tripTokenWarning:
			"Seu token de cancelamento é (não o compartilhe com ninguém!):",
		waitlist: `Viagem agendada com sucesso e adicionada à <a href="/waitlist">lista de espera</a>.`,
	},
	trip: {
		return: "Volta",
		roundTrip: "Ida e Volta",
		oneWay: "Ida",
	},
	tooEarly: "Volte novamente mais tarde! O ônibus não está disponível agora.",
	unauthorized: {
		h2: "Não Autorizado",
		p: "Perdão, mas você não tem permissão para visualizar essa página.",
	},
	yes: "Sim",
};
