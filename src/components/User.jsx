import { useContext, useState, useEffect } from "react";
import { SessionContext } from "../context/SessionContext";
import { supabase } from "../utils/supabase";
import styles from "./User.module.css";

export function User() {
  const { session, handleSignOut } = useContext(SessionContext);

  // Estados para produtos e formulário de cadastro
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    description: "",
    thumbnail: ""
  });

  // Buscar produtos se o usuário for admin
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("product_1v").select();
      if (!error) setProducts(data);
    }
    if (session?.user?.user_metadata?.admin) fetchProducts();
  }, [session]);

  // Funções de CRUD
  async function handleAddProduct(e) {
  e.preventDefault();

  const { data, error } = await supabase
    .from("product_1v")
    .insert([newProduct])
    .select(); // <- GARANTE QUE O SUPABASE DEVOLVA O OBJETO INSERIDO

  if (error) {
    console.error(error);
    return;
  }

  // Adiciona o novo produto imediatamente à lista
  setProducts((prev) => [...prev, data[0]]);

  // Limpa o formulário
  setNewProduct({ title: "", price: "", description: "", thumbnail: "" });
}


  async function handleDeleteProduct(id) {
    await supabase.from("product_1v").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  }

  async function handleUpdateProduct(id) {
    const newTitle = prompt("Novo título:");
    if (!newTitle) return;
    await supabase.from("product_1v").update({ title: newTitle }).eq("id", id);
    setProducts(products.map((p) => (p.id === id ? { ...p, title: newTitle } : p)));
  }

  return (
    <div className={styles.container}>
      {!session && <h1>User not signed in!</h1>}

      {session && (
        <>
          {/* Se for admin, mostra o dashboard */}
          {session.user.user_metadata.admin ? (
            <div className={styles.adminContainer}>
              <h1>Menu do admin</h1>

              {/* Form de adicionar produto */}
              <h2>Adicionar produto</h2>
              <form onSubmit={handleAddProduct} className={styles.addProductForm}>
                <input
                  type="text"
                  placeholder="Título"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Preço"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: Number(e.target.value) })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="URL da imagem"
                  value={newProduct.thumbnail}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, thumbnail: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder="Descrição"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  required
                ></textarea>

                <button type="submit">Adicionar</button>
              </form>

              {/* Tabela de produtos */}
              <h2>Produtos</h2>
              <table className={styles.productTable}>
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Título</th>
                    <th>Preço</th>
                    <th>Editar nome</th>
                    <th>Remover</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img src={product.thumbnail} alt={product.title} width="60" />
                      </td>
                      <td>{product.title}</td>
                      <td>${product.price}</td>
                      <td>
                        <button className={styles.editButton} onClick={() => handleUpdateProduct(product.id)}>
  Editar
</button>
                      </td>
                      <td>
                        <button className={styles.deleteButton} onClick={() => handleDeleteProduct(product.id)}>
  Remover
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <h1>Conta de usuário</h1>
          )}

          {/* Informações do usuário */}
          <div className={styles.userInfo}>
            <p>
              <strong>Usuário:</strong> {session.user.user_metadata.username}
            </p>
            <p>
              <strong>Email:</strong> {session.user.email}
            </p>
            <p>
              <strong>ID:</strong> {session.user.id}
            </p>
          </div>

          <button className={styles.button} onClick={handleSignOut}>
            SIGN OUT
          </button>
        </>
      )}
    </div>
  );
}