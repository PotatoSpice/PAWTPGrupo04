const Pedido = require('../models/pedido')

const fillPedido = async (req, res) => {
	const requestData = req.body
	const result = await new Pedido(requestData).save()
	res.send(result)
}

const getAllPedidos = async (req, res) => {
	const request = await Pedido.find();
	res.send(request);
}

const getPedidobyID = async (req, res) => {
	try {
		const request = await Pedido.findById(req.params.id)
			.catch((e) => {
				return null
			})
		res.send(request)
	} catch (e) {
		console.error(e)
		res.status(404)
		res.send(null)
	}
}

const getUserPedido = async (req, res) => {
	const request = await Pedido.find({ CCutente: req.params.id })
	res.send(request)
}

//Qualquer update básico funciona neste método. Podemos modificar partes do body consoante certas condições. O objetivo principal aqui é alterar os resultados e fechar o caso.
const updatePedido = async (req, res) => {
	try {
		const outdadRequest = await Pedido.findByIdAndUpdate(
			req.params.id,
			req.body)
		const updatedRequest = await Pedido.findById(req.params.id)
		res.send({
			old: outdadRequest,
			new: updatedRequest
		})
	} catch (e) {
		console.log(e)
		res.status(404)
		res.send(null)
	}
}

const updateDataPrimeiroTeste = async (req, res) => {
	const pedido = await Pedido.findById(req.params.id); // guardar o pedido que vai ser atualizado

	if (!pedido) {
		res.status(404).send('Pedido de Diagnóstico não existe!')
	}
	else if (pedido.casoFechado === true) {
		res.status(404).send('Pedido de Diagnóstico já foi concluído!')
	}
	else if (!req.body.dataInicial) {
		res.status(400).send('Bad Request. Dados em falta!')
	}
	else {
		try {
			// ## Marcar a data do primeiro teste # Será o primeiro update para o diagnostico
			if (pedido.dataInicial == null) { // Atualizar a data inicial só se ainda não existem resultados do primeiro teste
				await Pedido.findByIdAndUpdate(req.params.id, { dataInicial: req.body.dataInicial });

				const updatedPedido = await Pedido.findById(req.params.id);
				res.status(200).send({
					old: pedido,
					new: updatedPedido
				});
			} else {
				console.log(pedido.dataInicial)
				res.status(404).send('O primeiro teste já foi realizado!');
			}

		} catch (e) {
			console.log(e);
			res.status(404).end();
		}
	}
}

const updateResultadoPrimeiroTeste = async (req, res) => {
	const pedido = await Pedido.findById(req.params.id); // guardar o pedido que vai ser atualizado
	console.log(req.body.resultadoInicial, "\n", typeof req.body.resultadoInicial)
	if (!pedido) {
		res.status(404).send('Pedido de Diagnóstico não existe!')
	}
	else if (pedido.casoFechado === true) {
		res.status(404).send('Pedido de Diagnóstico já foi concluído!')
	}
	else if (req.body.resultadoInicial != null) { //Vai ser necessário modificar estes ifs. Não irá ser dificil, mas trabalhoso
		try {
			if (pedido.dataInicial != null) { // Atualizar o resultado do primeiro teste só se existir a data indicada 
				if (req.body.resultadoInicial === 'false' && req.body.dataFinal != null) { // Marcar a data para o segundo teste (48 horas de diferença) se o primeiro teste der negativo
					if (((new Date (req.body.dataFinal).getTime() - pedido.dataInicial.getTime()) / 3600000) >= 48) {
						await Pedido.findByIdAndUpdate(req.params.id, { resultadoInicial: req.body.resultadoInicial, dataFinal: req.body.dataFinal });
						const updatedPedido = await Pedido.findById(req.params.id);
						res.status(200).send({
							old: pedido,
							new: updatedPedido
						});
					} else {
						res.status(404).send('O teste não foi agendado! Verifique a data enviada, o teste deve ser agendado com uma diferença de 48 horas...')
					}
				} else if (req.body.resultadoInicial === 'true') { // caso o primeiro teste seja positivo, dá-se o diagnóstico como fechado
					await Pedido.findByIdAndUpdate(req.params.id, { resultadoInicial: req.body.resultadoInicial, casoFechado: true, infetado: true });
					const updatedPedido = await Pedido.findById(req.params.id);
					res.status(200).send({
						old: pedido,
						new: updatedPedido
					});
				} else {
					res.status(400).send('Bad Request. Dados em falta!');
				}

			} else {
				res.status(404).send('O teste não foi agendado!');
			}
		} catch (e) {
			console.log(e);
			res.status(404).end();
		}
	}
	else {
		res.status(400).send('Bad Request. Dados em falta!')
	}

}

const updateSegundaData = async (req, res) => {
	const pedido = await Pedido.findById(req.params.id);

	if (!pedido) {
		res.status(404).send('Pedido de Diagnóstico não existe!')
	}
	else if (pedido.casoFechado === true) {
		res.status(404).send('Pedido de Diagnóstico já foi concluído!')
	}
	else if (!req.body.dataFinal) {
		res.status(400).send('Bad Request. Dados em falta!')
	} else {
		if (pedido.dataInicial != null && pedido.dataFinal!=null) {
			if (((new Date (req.body.dataFinal).getTime() - pedido.dataInicial.getTime()) / 3600000) >= 48) {
				await Pedido.findByIdAndUpdate(req.params.id, { dataFinal: req.body.dataFinal });
				const updatedPedido = await Pedido.findById(req.params.id);
					res.status(200).send({
						old: pedido,
						new: updatedPedido
					});
			}else{
				res.status(400).send('Bad Request. Dados mal colocados!')
			}
		}else{
			res.status(404).send('Pedido de Diagnóstico não pode ser atualizado!')
		}
	}
}

const updateResultadoSegundoTeste = async (req, res) => {
	const pedido = await Pedido.findById(req.params.id); // guardar o pedido que vai ser atualizado
	if (!pedido) {
		res.status(404).send('Pedido de Diagnóstico não existe!')
	}
	else if (pedido.casoFechado === true) {
		res.status(404).send('Pedido de Diagnóstico já foi concluído!')
	}
	else if (!req.body.resultadoFinal) {
		res.status(400).send('Bad Request. Dados em falta!')
	}
	else {
		try {
			// ## Marcar o resultado do segundo teste # Será o possível terceiro update para o diagnostico
			if (pedido.dataFinal !== null) { // Atualizar o resultado do segundo teste só se existir a data indicada
				if (req.body.resultadoFinal === false) { // Marcar o caso como infetado ou não consoante o resultado do teste
					await Pedido.findByIdAndUpdate(req.params.id, { resultadoFinal: req.body.resultadoFinal, casoFechado: true, infetado: false });
				} else {
					await Pedido.findByIdAndUpdate(req.params.id, { resultadoFinal: req.body.resultadoFinal, casoFechado: true, infetado: true });
				}

				const updatedPedido = await Pedido.findById(req.params.id);
				res.status(200).send({
					old: pedido,
					new: updatedPedido
				});
			}
			else {
				res.status(404).send('O teste não foi agendado!');
			}

		} catch (e) {
			console.log(e);
			res.status(404).end();
		}
	}
}

const updateTecnicoResponsavel = async (req, res) => {
	//lógicas de negócio aqui
	if (req.body.tecnicoResponsavel !== null) {
		try {
			const outdadRequest = await Pedido.findByIdAndUpdate(
				req.params.id,
				{ tecnicoResponsavel: req.body.tecnicoResponsavel })
			const updatedRequest = await Pedido.findById(req.params.id)
			res.send({
				old: outdadRequest,
				new: updatedRequest
			})
		} catch (e) {
			console.log(e)
			res.status(404)
			res.send(null)
		}
	}
}

const updateFilePath = async (req, res) => {
	const pedido = await Pedido.findById(req.params.id);
	console.log(pedido.casoFechado)
	if(pedido.casoFechado==false){
		res.status(404).send('O teste não está concluído!');
	}else if (req.body.filepath) {
		try {
			const outdatedRequest = await Pedido.findByIdAndUpdate(
				req.params.id,
				{ filepath: req.body.filepath })
			const updatedRequest = await Pedido.findById(req.params.id)
			res.send({
				old: outdatedRequest,
				new: updatedRequest
			})
		} catch (e) {
			console.log(e)
			res.status(404)
			res.send(null)
		}
	}else{
		res.status(404).send('O teste não foi agendado!');
	}
}

const deletePedido = async (req, res) => {
	try {
		const outdadRequest = await Pedido.findByIdAndUpdate(
			req.params.id,
			{ deleted: true })
		const updatedRequest = await Pedido.findById(req.params.id)
		res.send({
			old: outdadRequest,
			new: updatedRequest
		})
	} catch (e) {
		console.log(e)
		res.status(404)
		res.send(null)
	}
}

const getSaude24Pedidos = async (req, res) => {
	const request = await Pedido.find({ encaminhado_saude24: true })
	res.send(request)
}

const getGrupoRiscoPedidos = async (req, res) => {
	const request = await Pedido.find({ grupoDeRisco: true })
	res.send(request)
}

const getTrabalhadoresRisco = async (req, res) => {
	const request = await Pedido.find({ trabalhadorDeRisco: true })
	res.send(request)
}

const getInfetados = async (req, res) => {
	const request = await Pedido.find({ infetado: true })
	res.send(request)
}

const getCasosAbertos = async (req, res) => {
	const request = await Pedido.find({ casofechado: false })
	res.send(request)
}

const getPositivos = async (req, res) => {
	const request = await Pedido.find({ casoFechado: true, infetado: true })
	res.send(request)
}

const getNegativos = async (req, res) => {
	const request = await Pedido.find({ casoFechado: true, infetado: false })//({ $or: [{ casoFechado: true, resultadoInicial: false }, { casoFechado: true, resultadoInicial: true, resultadoFinal: false }] })
	res.send(request)
}

const countPerDay = async (req, res) => {
	const request = await Pedido.countDocuments({ $or: [{ dataInicial: req.body.id }, { dataFinal: req.body.id }] })
	res.send(request)
}

module.exports = {
	fillPedido,
	getAllPedidos,
	getPedidobyID,
	updatePedido,
	getUserPedido,
	deletePedido,
	getSaude24Pedidos,
	getGrupoRiscoPedidos,
	getTrabalhadoresRisco,
	getInfetados,
	getCasosAbertos,
	getPositivos,
	getNegativos,
	updateDataPrimeiroTeste,
	updateResultadoPrimeiroTeste,
	updateResultadoSegundoTeste,
	updateTecnicoResponsavel,
	countPerDay,
	updateSegundaData,
	updateFilePath
}