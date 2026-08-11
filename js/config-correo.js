/**
 * Configura EmailJS para enviar correos reales (Gmail u otro).
 * 1. Crea cuenta en https://www.emailjs.com/
 * 2. Conecta tu servicio de correo (Gmail)
 * 3. Crea una plantilla con variables: {{to_email}}, {{subject}}, {{message_html}}, {{user_name}}
 * 4. Pega aquí tus IDs
 */
const ConfigCorreo = {
  publicKey: "",
  serviceId: "",
  templateId: "",
  nombreBiblioteca: "Biblioteca SENA",

  estaConfigurado() {
    return Boolean(this.publicKey && this.serviceId && this.templateId);
  },
};
