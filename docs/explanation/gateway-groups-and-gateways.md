# Gateway Group & Gateway

Gateway Groups & Gateways are the last pieces to fully understand the reShapr possibilities from end-to-end! 

As it has been introduced in [Why reShapr?](why-reshapr.md), the reShapr architecture allows deployment on different types and locations of Gateways depending on your subscription plan. In the reShapr architecture, the Gateways are not typically known from the start and are presented in a static list. Gateways are made to be started and stopped in a highly dynamic way and advertise themselves to the control plane at startup. However, to define the exposition and deployment targets of your MCP server, the control plane can define its policies using abstract representations called *Gateway Groups*.

A Gateway Group is a named resource owned and dedicated to an organization—the `reshapr`organization is a special one that shares its gateway groups with the reShapr users. A Gateway Group also defines a set of labels that represent **exposition policies and criteria**. Labels can represent a geographical region, a certain SLO and performance level, a lifecycle environment or a combination of all of these. Depending on your subscription plan, you will have access to one or more Gateway Groups.

![Capture d'écran 2025-09-24 à 16.16.26.png](gateway-groups-and-gateways/Capture_decran_2025-09-24_a_16.16.26.png)

During its bootstrap phase, a reShapr Gateway will advertise itself to the control plane and discover the MCP Servers it has to expose. This discovery is made according to the [Exposition](configuration-and-exposition.md) you previously created and the policies or Gateway Groups you choose. To do so, the Gateway presents **a set of selectors** that will be used during the discovery and throughout its lifetime to synchronize its [Service](services-and-artifacts.md) definitions and [Configuration Plans](configuration-and-exposition.md). While it is alive, an ephemeral Gateway representation is tied to the Gateway Group in the control plane.

<aside>
💡

A Gateway is not necessarily attached to a single Gateway Group ; it can be attached to many of them as long as its selectors match the labels (exposition criteria) of the group! You could have a set of Gateways with a unique selector `org=acme` matching all the Acme’s Gateway Groups.

</aside>

[Back to Home](../index.mdx)