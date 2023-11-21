"use client"
import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { isTokenValid } from '@/services/token/verificarToken';
import Loading from '@/components/Loading';
import BuscaLanchonete from '@/services/BuscaLanchonete';
import RedirectGerente from '@/services/RedirectGerente';

export default function MinhaPaginaInicial() {
    const [redirectGerente, setRedirectGerente] = useState(null)
    const [idGerente, setIdGerente] = useState('')
    const [tipo, setTipo] = useState('');
    const [erro, setErro] = useState(null);
    const [token, setToken] = useState('');
    const router = useRouter();

    const fetchData = async () => {
        const storedToken = localStorage.getItem('token');

        if (storedToken) {
            const tokenStatus = isTokenValid(storedToken);
            if (tokenStatus.isValid) {
                setToken(storedToken);

                try {
                    const decoded = jwtDecode(storedToken);
                    console.log(decoded);
                    setTipo(decoded.tipo);

                    if (decoded.tipo === 'cliente') {
                        router.push('/home');
                    } else if (decoded.tipo === 'gerente') {
                        setRedirectGerente(true)
                        setIdGerente(decoded.id)
                    }
                } catch (error) {
                    console.error(error);

                    if (error.name === 'TokenExpiredError') {
                        setErro(error.name);
                    } else if (error.name === 'JsonWebTokenError') {
                        setErro(error.name);
                    } else {
                        setErro(error.name);
                    }
                }
            } else if (tokenStatus.status === 'expirado' || tokenStatus.status === 'invalido') {
                // Remova o token do localStorage se estiver expirado ou inválido
                localStorage.removeItem('token');

                if (tokenStatus.status === 'expirado') {
                    setErro('token expirado');
                } else {
                    setErro('acesso inválido');
                }

                // Redirecione para a página de autenticação
                router.push('/auth/signin');
            }
        } else {
            router.push('/inicio');
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    if (redirectGerente) {
        RedirectGerente(idGerente)
    }

    return (
        <div>
            <Loading />
        </div>
    );
};
